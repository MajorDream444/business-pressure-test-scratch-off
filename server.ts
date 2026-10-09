import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import submitHandler from './api/submit.js';

dotenv.config({ path: 'env/.env.local' });
dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load .env as fallback for standard platform secrets

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Same handler Vercel runs in production, so local and live behave identically.
  app.post('/api/submit', (req, res) => {
    void submitHandler(req as unknown as VercelRequest, res as unknown as VercelResponse);
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
