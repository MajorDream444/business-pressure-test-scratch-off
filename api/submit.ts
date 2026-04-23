import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, telegramOrPhone, score, notes } = req.body as {
    name: string;
    email: string;
    telegramOrPhone: string;
    score: number;
    notes: string;
  };

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const pat = process.env.AIRTABLE_PAT;
  const source = process.env.APP_SOURCE || 'business-pressure-test';

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
                Name: name ?? '',
                Email: email ?? '',
                Telegram_or_Phone: telegramOrPhone ?? '',
                Notes: notes ?? '',
                Score: typeof score === 'number' ? score : parseInt(String(score), 10),
                Source: source,
              },
            },
          ],
        }),
      }
    );

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      console.error('[submit] Airtable error:', airtableRes.status, text);
      return res.status(502).json({ error: 'Failed to save submission' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[submit] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
