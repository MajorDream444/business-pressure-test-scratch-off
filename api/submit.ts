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

  // Defensive parse — handles both pre-parsed object and raw string body
  const raw = req.body;
  const p: Payload =
    typeof raw === 'string'
      ? (JSON.parse(raw) as Payload)
      : raw && typeof raw === 'object'
      ? (raw as Payload)
      : {};

  console.log('[submit] received:', {
    submissionId: p.submissionId,
    name:         p.name,
    email:        p.email,
    totalScore:   p.totalScore,
    scoreBand:    p.scoreBand,
    priority:     p.priority,
  });

  const baseId  = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const pat     = process.env.AIRTABLE_PAT;

  if (!baseId || !tableId || !pat) {
    console.error('[submit] Missing Airtable env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const fields: Record<string, string | number> = {
    // ── Identity ──────────────────────────────────────────────────────────────
    'Name':              p.name            ?? '',
    'First Name':        p.firstName       ?? '',
    'Last Name':         p.lastName        ?? '',
    'Email':             p.email           ?? '',
    'Telegram_or_Phone': p.telegramOrPhone ?? '',
    'Source':            p.source          ?? 'business-pressure-test',
    'Submitted At':      p.submittedAt     ?? new Date().toISOString(),
    'App Version':       p.appVersion      ?? 'v2',
    'Submission ID':     p.submissionId    ?? '',

    // ── Business context ──────────────────────────────────────────────────────
    'Business Type':  p.businessType  ?? '',
    'Revenue Range':  p.revenueRange  ?? '',
    'Biggest Issue':  p.biggestIssue  ?? '',

    // ── Quiz answers (label text) ─────────────────────────────────────────────
    'Q1':  p.answers?.q1  ?? '',
    'Q2':  p.answers?.q2  ?? '',
    'Q3':  p.answers?.q3  ?? '',
    'Q4':  p.answers?.q4  ?? '',
    'Q5':  p.answers?.q5  ?? '',
    'Q6':  p.answers?.q6  ?? '',
    'Q7':  p.answers?.q7  ?? '',
    'Q8':  p.answers?.q8  ?? '',
    'Q9':  p.answers?.q9  ?? '',
    'Q10': p.answers?.q10 ?? '',

    // ── Per-question scores ───────────────────────────────────────────────────
    'Score Q1':  p.scores?.q1  ?? 0,
    'Score Q2':  p.scores?.q2  ?? 0,
    'Score Q3':  p.scores?.q3  ?? 0,
    'Score Q4':  p.scores?.q4  ?? 0,
    'Score Q5':  p.scores?.q5  ?? 0,
    'Score Q6':  p.scores?.q6  ?? 0,
    'Score Q7':  p.scores?.q7  ?? 0,
    'Score Q8':  p.scores?.q8  ?? 0,
    'Score Q9':  p.scores?.q9  ?? 0,
    'Score Q10': p.scores?.q10 ?? 0,

    // ── Scoring + routing ─────────────────────────────────────────────────────
    'Total Score':       p.totalScore       ?? 0,
    'Score Band':        p.scoreBand        ?? '',
    'Priority':          p.priority         ?? '',
    'Primary Leak':      p.primaryLeak      ?? '',
    'Diagnosis Summary': p.diagnosisSummary ?? '',
    'Recommended Offer': p.recommendedOffer ?? '',
    'Next Step':         p.nextStep         ?? '',

    // ── Backup ────────────────────────────────────────────────────────────────
    'Raw Payload JSON':  JSON.stringify(p),
  };

  console.log('[submit] writing to Airtable — fields count:', Object.keys(fields).length);

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
      {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error('[submit] Airtable error:', airtableRes.status, responseText);
      return res.status(502).json({ error: 'Failed to save submission', detail: responseText });
    }

    console.log('[submit] success:', p.name, p.email, p.totalScore, p.priority);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[submit] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
