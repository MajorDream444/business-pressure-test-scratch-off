import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { buildEmail } from './email-template.js';
import { BIZ_TYPES, REVENUE_RANGES, scoreSubmission } from '../src/scoring.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMISSION_ID_RE = /^bpt_[A-Za-z0-9_-]{8,64}$/;
const EMAIL_TIMEOUT_MS = 8000;

function text(v: unknown, min: number, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}

function parseBody(raw: unknown): Record<string, unknown> | null {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

async function airtableError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { type?: string; message?: string } | string };
    const e = j.error;
    return typeof e === 'string' ? e : `${e?.type ?? ''} ${e?.message ?? ''}`.trim().slice(0, 200);
  } catch {
    return 'unparseable error body';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = randomUUID().slice(0, 8);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req.body);
  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON body', requestId });
  }

  // ── Validate (never log the values — they are personal data) ────────────────
  const problems: string[] = [];

  const firstName = text(body.firstName, 1, 60);
  if (!firstName) problems.push('firstName');

  const lastName = body.lastName === undefined || body.lastName === '' ? '' : text(body.lastName, 1, 60);
  if (lastName === null) problems.push('lastName');

  const email = text(body.email, 3, 254);
  if (!email || !EMAIL_RE.test(email)) problems.push('email');

  const telegramOrPhone = text(body.telegramOrPhone, 3, 64);
  if (!telegramOrPhone) problems.push('telegramOrPhone');

  const businessType = typeof body.businessType === 'string' && (BIZ_TYPES as readonly string[]).includes(body.businessType)
    ? body.businessType : null;
  if (!businessType) problems.push('businessType');

  const revenueRange = typeof body.revenueRange === 'string' && (REVENUE_RANGES as readonly string[]).includes(body.revenueRange)
    ? body.revenueRange : null;
  if (!revenueRange) problems.push('revenueRange');

  const biggestIssue = body.biggestIssue === undefined || body.biggestIssue === ''
    ? ''
    : text(body.biggestIssue, 1, 1000);
  if (biggestIssue === null) problems.push('biggestIssue');

  const submissionId =
    typeof body.submissionId === 'string' && SUBMISSION_ID_RE.test(body.submissionId)
      ? body.submissionId
      : body.submissionId === undefined
        ? `bpt_${randomUUID().replace(/-/g, '')}`
        : null;
  if (!submissionId) problems.push('submissionId');

  const scored = scoreSubmission(body.answers);
  if (!scored) problems.push('answers');

  if (problems.length || !scored || !firstName || !email || !telegramOrPhone ||
      !businessType || !revenueRange || !submissionId || lastName === null || biggestIssue === null) {
    console.warn(`[submit ${requestId}] rejected invalid fields: ${problems.join(',')}`);
    return res.status(400).json({ error: 'Invalid submission', fields: problems, requestId });
  }

  const baseId  = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const pat     = process.env.AIRTABLE_PAT;
  if (!baseId || !tableId || !pat) {
    console.error(`[submit ${requestId}] missing Airtable env vars`);
    return res.status(500).json({ error: 'Server configuration error', requestId });
  }

  const tableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const authHeaders = { Authorization: `Bearer ${pat}`, 'Content-Type': 'application/json' };

  try {
    // ── Idempotency: a retried submission must not create a second row/email ──
    const lookup = await fetch(
      `${tableUrl}?maxRecords=1&fields%5B%5D=Submission%20ID&filterByFormula=${encodeURIComponent(`{Submission ID}="${submissionId}"`)}`,
      { headers: authHeaders }
    );
    if (lookup.ok) {
      const found = (await lookup.json()) as { records?: unknown[] };
      if (found.records?.length) {
        console.log(`[submit ${requestId}] duplicate submissionId=${submissionId} — skipped`);
        return res.status(200).json({ success: true, duplicate: true, requestId });
      }
    } else {
      console.warn(`[submit ${requestId}] duplicate lookup failed (${lookup.status}) — continuing`);
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const fields: Record<string, string | number> = {
      'Name':              fullName,
      'First Name':        firstName,
      'Last Name':         lastName,
      'Email':             email,
      'Telegram_or_Phone': telegramOrPhone,
      'Source':            process.env.APP_SOURCE || 'business-pressure-test',
      'Submitted At':      new Date().toISOString(),
      'App Version':       'v2',
      'Submission ID':     submissionId,
      'Business Type':     businessType,
      'Revenue Range':     revenueRange,
      'Biggest Issue':     biggestIssue,
      'Score':             scored.totalScore,
      'Total Score':       scored.totalScore,
      'Score Band':        scored.scoreBand,
      'Priority':          scored.priority,
      'Primary Leak':      scored.primaryLeak,
      'Diagnosis Summary': scored.diagnosisSummary,
      'Recommended Offer': scored.recommendedOffer,
      'Next Step':         scored.nextStep,
    };
    for (let i = 1; i <= 10; i++) {
      fields[`Q${i}`]       = scored.answers[`q${i}`];
      fields[`Score Q${i}`] = scored.scores[`q${i}`];
    }
    fields['Raw Payload JSON'] = JSON.stringify({
      submissionId, firstName, lastName, email, telegramOrPhone, businessType,
      revenueRange, biggestIssue, answers: scored.answers, scores: scored.scores,
      totalScore: scored.totalScore,
    });

    const created = await fetch(tableUrl, {
      method: 'POST',
      headers: authHeaders,
      // typecast lets Airtable add new single-select options (e.g. Source) instead of rejecting the row
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });

    if (!created.ok) {
      console.error(`[submit ${requestId}] Airtable create failed: ${created.status} ${await airtableError(created)}`);
      return res.status(502).json({ error: 'Failed to save submission', requestId });
    }

    const recordId = ((await created.json()) as { records?: { id: string }[] }).records?.[0]?.id;
    console.log(`[submit ${requestId}] saved submissionId=${submissionId} record=${recordId} score=${scored.totalScore} priority=${scored.priority}`);

    // ── Results email: bounded wait, outcome persisted, never fails the lead ──
    let emailStatus = 'skipped: RESEND_API_KEY not set';
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { subject, html } = buildEmail(
          {
            firstName,
            totalScore:       scored.totalScore,
            scoreBand:        scored.scoreBand,
            priority:         scored.priority,
            diagnosisSummary: scored.diagnosisSummary,
            biggestIssue,
            leaks:            scored.leaks,
            nextMoves:        scored.nextMoves,
            recommendedOffer: scored.recommendedOffer,
          },
          process.env.VITE_CALENDLY_URL ?? ''
        );
        const { error } = await withTimeout(
          new Resend(resendKey).emails.send(
            {
              from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
              to: email,
              subject,
              html,
            },
            { idempotencyKey: `results-${submissionId}` }
          ),
          EMAIL_TIMEOUT_MS
        );
        emailStatus = error ? `failed: ${error.name}`.slice(0, 100) : 'sent';
        if (error) console.error(`[submit ${requestId}] email error: ${error.name} ${error.message}`);
      } catch (e) {
        emailStatus = `failed: ${e instanceof Error ? e.message : 'unknown'}`.slice(0, 100);
        console.error(`[submit ${requestId}] email exception: ${emailStatus}`);
      }
    }

    if (recordId) {
      // Best effort: needs an "Email Status" text field (created by scripts/setup-airtable.ts)
      const patch = await fetch(tableUrl, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ records: [{ id: recordId, fields: { 'Email Status': emailStatus } }] }),
      }).catch(() => null);
      if (!patch?.ok) console.warn(`[submit ${requestId}] could not persist Email Status`);
    }

    return res.status(200).json({ success: true, email: emailStatus.split(':')[0], requestId });
  } catch (err) {
    console.error(`[submit ${requestId}] unexpected error:`, err instanceof Error ? err.message : 'unknown');
    return res.status(500).json({ error: 'Internal server error', requestId });
  }
}
