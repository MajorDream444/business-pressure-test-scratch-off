import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Defensive parse — Vercel ESM projects can receive body as a raw string
  const raw = req.body;
  const body: Record<string, unknown> =
    typeof raw === 'string'
      ? JSON.parse(raw)
      : raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};

  const name            = String(body.name            ?? '');
  const email           = String(body.email           ?? '');
  const telegramOrPhone = String(body.telegramOrPhone ?? '');
  const notes           = String(body.notes           ?? '');
  const score           = Number(body.score           ?? 0);

  console.log('[submit] received:', { name, email, telegramOrPhone, score });

  const baseId  = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const pat     = process.env.AIRTABLE_PAT;
  const source  = process.env.APP_SOURCE || 'business-pressure-test';

  if (!baseId || !tableId || !pat) {
    console.error('[submit] Missing Airtable env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Name:             name,
                Email:            email,
                Telegram_or_Phone: telegramOrPhone,
                Notes:            notes,
                Score:            score,
                Source:           source,
              },
            },
          ],
        }),
      }
    );

    const responseText = await airtableRes.text();

    if (!airtableRes.ok) {
      console.error('[submit] Airtable error:', airtableRes.status, responseText);
      return res.status(502).json({ error: 'Failed to save submission', detail: responseText });
    }

    console.log('[submit] Airtable success:', name, email, score);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[submit] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
