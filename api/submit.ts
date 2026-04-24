import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Payload {
  submissionId?:     string;
  submittedAt?:      string;
  appVersion?:       string;
  firstName?:        string;
  lastName?:         string;
  name?:             string;
  email?:            string;
  telegramOrPhone?:  string;
  source?:           string;
  businessType?:     string;
  revenueRange?:     string;
  biggestIssue?:     string;
  answers?:          Record<string, string>;
  scores?:           Record<string, number>;
  totalScore?:       number;
  scoreBand?:        string;
  priority?:         string;
  primaryLeak?:      string;
  diagnosisSummary?: string;
  recommendedOffer?: string;
  nextStep?:         string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Defensive parse — handles pre-parsed object or raw string body
  const raw = req.body;
  const body: Payload =
    typeof raw === 'string'
      ? (JSON.parse(raw) as Payload)
      : raw && typeof raw === 'object'
        ? (raw as Payload)
        : {};

  console.log('BODY:', JSON.stringify(body, null, 2));

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !tableId || !pat) {
    console.error('[submit] Missing Airtable env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const fields: Record<string, string | number> = {
    // ── Identity ──────────────────────────────────────────────────────────────
    'Name':              body.name            ?? '',
    'First Name':        body.firstName       ?? '',
    'Last Name':         body.lastName        ?? '',
    'Email':             body.email           ?? '',
    'Telegram_or_Phone': body.telegramOrPhone ?? '',
    'Source':            body.source          ?? 'business-pressure-test',
    'Submitted At':      body.submittedAt     ?? new Date().toISOString(),
    'App Version':       body.appVersion      ?? 'v2',
    'Submission ID':     body.submissionId    ?? '',

    // ── Business context ──────────────────────────────────────────────────────
    'Business Type': body.businessType ?? '',
    'Revenue Range': body.revenueRange ?? '',
    'Biggest Issue': body.biggestIssue ?? '',

    // ── Quiz answers ──────────────────────────────────────────────────────────
    'Q1':  body.answers?.q1  ?? '',
    'Q2':  body.answers?.q2  ?? '',
    'Q3':  body.answers?.q3  ?? '',
    'Q4':  body.answers?.q4  ?? '',
    'Q5':  body.answers?.q5  ?? '',
    'Q6':  body.answers?.q6  ?? '',
    'Q7':  body.answers?.q7  ?? '',
    'Q8':  body.answers?.q8  ?? '',
    'Q9':  body.answers?.q9  ?? '',
    'Q10': body.answers?.q10 ?? '',

    // ── Per-question scores ───────────────────────────────────────────────────
    'Score Q1':  body.scores?.q1  ?? 0,
    'Score Q2':  body.scores?.q2  ?? 0,
    'Score Q3':  body.scores?.q3  ?? 0,
    'Score Q4':  body.scores?.q4  ?? 0,
    'Score Q5':  body.scores?.q5  ?? 0,
    'Score Q6':  body.scores?.q6  ?? 0,
    'Score Q7':  body.scores?.q7  ?? 0,
    'Score Q8':  body.scores?.q8  ?? 0,
    'Score Q9':  body.scores?.q9  ?? 0,
    'Score Q10': body.scores?.q10 ?? 0,

    // ── Scoring + routing ─────────────────────────────────────────────────────
    'Score':             body.totalScore       ?? 0,   // keep existing column
    'Total Score':       body.totalScore       ?? 0,
    'Score Band':        body.scoreBand        ?? '',
    'Priority':          body.priority         ?? '',
    'Primary Leak':      body.primaryLeak      ?? '',
    'Diagnosis Summary': body.diagnosisSummary ?? '',
    'Recommended Offer': body.recommendedOffer ?? '',
    'Next Step':         body.nextStep         ?? '',

    // ── Backup ────────────────────────────────────────────────────────────────
    'Raw Payload JSON': JSON.stringify(body),
  };

  console.log('AIRTABLE PAYLOAD:', JSON.stringify(fields, null, 2));

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${pat}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error('[submit] Airtable error:', airtableRes.status, responseText);
      return res.status(502).json({
        error:  'Failed to save submission',
        status: airtableRes.status,
        detail: JSON.parse(responseText),
      });
    }

    console.log('[submit] success:', body.name, body.email, body.totalScore, body.priority);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[submit] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: String(err) });
  }
}
