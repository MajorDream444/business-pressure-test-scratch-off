import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load .env as fallback for standard platform secrets

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DATA_DIR = path.resolve('data');
  const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

  app.use(express.json());

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_ALERT_BOT_TOKEN || '';
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ALERT_CHAT_ID || '';

  async function sendTelegramAlert(message: string) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Telegram alert failed: ${text}`);
    }
  }

  // API routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'business-pressure-test-api' });
  });

  app.post('/api/event', async (req, res) => {
    try {
      const { type, lead_data } = req.body;

      let msg = '';
      if (type === 'CALL_BOOKED') {
        msg = `<b>📅 CALL BOOKED</b>\n\nA new prospect booked a strategy call.\nCheck Calendly for details.`;
      } else if (type === 'HIGH_INTENT_ACTION') {
        msg = `<b>🔥 HIGH INTENT ACTION</b>\n\nA user clicked “Fix it now.”\nReview lead details and follow up fast.`;
      }

      if (lead_data && msg) {
        msg += `\n\n<b>Name:</b> ${lead_data.first_name || '-'}\n<b>Email:</b> ${lead_data.email || '-'}`;
      }

      if (msg) {
        await sendTelegramAlert(msg);
      }

      return res.json({ ok: true });
    } catch (error) {
      console.error('Event alert error:', error);
      return res.status(500).json({ ok: false, error: 'Failed to send event alert' });
    }
  });

  app.post('/api/lead', async (req, res) => {
    try {
      const payload = req.body;

      if (!payload?.first_name || !payload?.email) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }

      const record = {
        ...payload,
        received_at: new Date().toISOString(),
        user_agent: req.headers['user-agent'] || '',
        ip:
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          req.socket.remoteAddress ||
          '',
      };

      fs.appendFileSync(LEADS_FILE, JSON.stringify(record) + '\n', 'utf8');

      if (process.env.LEAD_WEBHOOK_URL) {
        try {
          await fetch(process.env.LEAD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });
        } catch (webhookErr) {
          console.error('Webhook forward failed:', webhookErr);
        }
      }

      if (record.priority === 'HOT') {
        const msg =
          `<b>🚨 HOT LEAD</b>\n\n` +
          `<b>Name:</b> ${record.first_name}\n` +
          `<b>Email:</b> ${record.email}\n` +
          `<b>Business:</b> ${record.business_type || '-'}\n` +
          `<b>Revenue:</b> ${record.revenue_range || '-'}\n` +
          `<b>Score:</b> ${record.score}\n` +
          `<b>Band:</b> ${record.band_title}\n\n` +
          `<b>Issue:</b>\n${record.biggest_issue || '-'}\n\n` +
          `<b>Time:</b>\n${new Date().toLocaleString()}\n\n` +
          `<a href="https://t.me/major_hanzo">💬 Message Major Now</a>`;

        try {
          await sendTelegramAlert(msg);
        } catch (telegramErr) {
          console.error('Telegram alert failed:', telegramErr);
        }
      }

      console.log(
        'NEW LEAD:',
        record.first_name,
        record.email,
        record.score,
        record.band_title,
        record.priority
      );

      return res.json({ ok: true });
    } catch (error) {
      console.error('Lead save error:', error);
      return res.status(500).json({ ok: false, error: 'Failed to save lead' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
