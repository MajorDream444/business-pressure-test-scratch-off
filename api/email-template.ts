interface EmailData {
  firstName:        string;
  totalScore:       number;
  scoreBand:        string;
  priority:         string;
  diagnosisSummary: string;
  biggestIssue:     string;
  leaks:            string[];
  nextMoves:        string[];
  recommendedOffer: string;
}

interface BandTheme {
  accent:      string;
  subject:     string;
  headline:    string;
  subline:     string;
  ctaHeadline: string;
  ctaBtn:      string;
}

function getBandTheme(score: number, name: string, band: string): BandTheme {
  if (score <= 25) return {
    accent:      '#f87171',
    subject:     `${name}, your score is ${score} — your business stops when you stop`,
    headline:    `Your results are in, ${name}.<br>Your business runs on you — and that's the problem.`,
    subline:     `You scored <strong>${score}/100</strong> — <strong>${band}</strong>. The business depends heavily on your daily effort. If you stop, most things slow down or break.`,
    ctaHeadline: `Build the foundation.<br>Book your free strategy call.`,
    ctaBtn:      `Book My Strategy Call →`,
  };
  if (score <= 50) return {
    accent:      '#fb923c',
    subject:     `${name}, your score is ${score} — here's where you're leaking`,
    headline:    `Your results are in, ${name}.<br>Your business is leaking — here's the map.`,
    subline:     `You scored <strong>${score}/100</strong> — <strong>${band}</strong>. The gaps are fixable, but they're costing you monthly.`,
    ctaHeadline: `Stop the leak.<br>Book your free strategy call.`,
    ctaBtn:      `Book My Strategy Call →`,
  };
  if (score <= 75) return {
    accent:      '#facc15',
    subject:     `${name}, your score is ${score} — you're functional but you've hit a ceiling`,
    headline:    `Your results are in, ${name}.<br>The business works — but it's capped.`,
    subline:     `You scored <strong>${score}/100</strong> — <strong>${band}</strong>. There's real structure here, but there's a ceiling and it's getting closer.`,
    ctaHeadline: `Break the ceiling.<br>Book your free strategy call.`,
    ctaBtn:      `Book My Strategy Call →`,
  };
  return {
    accent:      '#4ade80',
    subject:     `${name}, your score is ${score} — your foundation is strong. Here's what's next.`,
    headline:    `Your results are in, ${name}.<br>Your foundation is strong. Now let's scale it.`,
    subline:     `You scored <strong>${score}/100</strong> — <strong>${band}</strong>. You have real structure. The next move isn't fixing — it's scaling and building leverage.`,
    ctaHeadline: `Time to scale.<br>Let's build the next layer.`,
    ctaBtn:      `Book My Scale Call →`,
  };
}

function barWidth(score: number): string {
  return `${Math.max(4, Math.min(score, 100))}%`;
}

function listItems(items: string[], color: string, arrow: string): string {
  return items.map(item => `
    <tr>
      <td style="padding:0 0 10px 0;vertical-align:top;width:18px;color:${color};font-size:14px;">${arrow}</td>
      <td style="padding:0 0 10px 12px;font-size:13px;color:${color};line-height:1.5;">${item}</td>
    </tr>`).join('');
}

export function buildEmail(data: EmailData, calendlyUrl: string): { subject: string; html: string } {
  const theme = getBandTheme(data.totalScore, data.firstName, data.scoreBand);
  const a = theme.accent;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${theme.subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0f0f;">
<tr><td align="center" style="padding:32px 16px;">

  <!-- Email card -->
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#141414;border-radius:12px;overflow:hidden;border:1px solid #222;">

    <!-- Accent bar -->
    <tr><td style="height:3px;background:linear-gradient(90deg,${a} 0%,transparent 100%);font-size:0;">&nbsp;</td></tr>

    <!-- Header -->
    <tr><td style="padding:36px 44px 28px;border-bottom:1px solid #1e1e1e;">
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${a};font-weight:700;">
        ● &nbsp;Business Pressure Test
      </p>
      <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#f0f0f0;line-height:1.3;">
        ${theme.headline}
      </h1>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">${theme.subline}</p>
    </td></tr>

    <!-- Score -->
    <tr><td style="padding:32px 44px;border-bottom:1px solid #1e1e1e;">
      <!-- Score row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Circle -->
          <td style="width:96px;vertical-align:middle;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="width:96px;height:96px;border-radius:50%;border:2px solid ${a};background:#0f0f0f;text-align:center;vertical-align:middle;">
                <p style="margin:0;font-size:36px;font-weight:800;color:${a};line-height:1;">${data.totalScore}</p>
                <p style="margin:0;font-size:10px;color:#555;letter-spacing:0.08em;">/ 100</p>
              </td></tr>
            </table>
          </td>
          <!-- Meta -->
          <td style="padding-left:24px;vertical-align:middle;">
            <span style="display:inline-block;background:rgba(255,255,255,0.04);border:1px solid ${a}44;color:${a};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:8px;">
              ${data.scoreBand} &nbsp;·&nbsp; ${data.priority}
            </span>
            <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#efefef;">${data.scoreBand}</p>
            <p style="margin:0;font-size:11px;color:#555;letter-spacing:0.06em;">Recommended: ${data.recommendedOffer}</p>
          </td>
        </tr>
      </table>

      <!-- Score bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
        <tr><td style="background:#0f0f0f;border-radius:999px;height:6px;overflow:hidden;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr><td style="width:${barWidth(data.totalScore)};height:6px;background:linear-gradient(90deg,#333,${a});border-radius:999px;">&nbsp;</td></tr>
          </table>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:5px;">
            <tr>
              <td style="font-size:10px;color:#444;letter-spacing:0.06em;">Critical</td>
              <td style="font-size:10px;color:#444;letter-spacing:0.06em;text-align:center;">Leaking</td>
              <td style="font-size:10px;color:#444;letter-spacing:0.06em;text-align:center;">Functional</td>
              <td style="font-size:10px;color:#444;letter-spacing:0.06em;text-align:right;">Strong</td>
            </tr>
          </table>
        </td></tr>
      </table>

      ${data.biggestIssue ? `
      <!-- Challenge echo -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
        <tr>
          <td style="width:3px;background:${a};border-radius:0 0 0 0;">&nbsp;</td>
          <td style="padding:12px 16px;background:#0f0f0f;border-radius:0 6px 6px 0;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;">You said your biggest challenge is</p>
            <p style="margin:0;font-size:13px;color:#aaa;line-height:1.5;font-style:italic;">"${data.biggestIssue}"</p>
          </td>
        </tr>
      </table>` : ''}

      <!-- Diagnosis -->
      <p style="margin:20px 0 0;font-size:14px;color:#888;line-height:1.7;">${data.diagnosisSummary}</p>
    </td></tr>

    <!-- Leaks + Moves (2 col) -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr valign="top">
          <!-- Leaks -->
          <td width="50%" style="padding:28px 22px 28px 44px;border-bottom:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#555;">Where you're leaking</p>
            <table cellpadding="0" cellspacing="0" border="0">
              ${listItems(data.leaks, '#f87171', '↓')}
            </table>
          </td>
          <!-- Moves -->
          <td width="50%" style="padding:28px 44px 28px 22px;border-bottom:1px solid #1e1e1e;">
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#555;">Your next moves</p>
            <table cellpadding="0" cellspacing="0" border="0">
              ${listItems(data.nextMoves, '#c9a227', '→')}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Call steps -->
    <tr><td style="padding:28px 44px;border-bottom:1px solid #1e1e1e;">
      <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#555;">What happens on the 45-min strategy call</p>
      ${[
        ['Diagnose your specific leak', 'We go deeper on your answers — the exact root cause for your business, not generic advice.'],
        ['You leave with a fix plan', 'What to build, what to cut, what to do in the first 14 days. You\'ll know exactly what\'s next.'],
        ['Your $100 credit is applied', 'Whatever we build together, your Build Credit comes off the top — automatically.'],
      ].map(([title, body], i) => `
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;width:100%;">
        <tr valign="top">
          <td style="width:28px;height:28px;border-radius:50%;background:#1a1a1a;border:1px solid #2a2a2a;text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:${a};">${i + 1}</td>
          <td style="padding-left:14px;vertical-align:top;padding-top:4px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#ddd;">${title}</p>
            <p style="margin:0;font-size:12px;color:#555;line-height:1.55;">${body}</p>
          </td>
        </tr>
      </table>`).join('')}
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:36px 44px;text-align:center;background:linear-gradient(180deg,#141414 0%,#0f0d00 100%);">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${a};">🎁 Your $100 Build Credit is reserved</p>
      <h2 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#f0f0f0;line-height:1.3;">${theme.ctaHeadline}</h2>
      <p style="margin:0 0 28px;font-size:13px;color:#666;line-height:1.6;">
        45 minutes. We map the fix and you leave with a clear plan.<br>Your credit applies automatically — no awkward pitch.
      </p>
      <a href="${calendlyUrl}" style="display:block;background:${a};color:#0a0a0a;text-decoration:none;font-size:15px;font-weight:800;padding:16px 24px;border-radius:8px;text-align:center;margin-bottom:10px;letter-spacing:0.02em;">
        ${theme.ctaBtn}
      </a>
      <p style="margin:20px 0 0;font-size:11px;color:#444;letter-spacing:0.06em;">
        Credit expires in 7 days &nbsp;·&nbsp; No payment required for the call
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:20px 44px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0;font-size:11px;color:#383838;line-height:1.9;">
        Business Pressure Test &nbsp;·&nbsp; You completed this on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br>
        <a href="#" style="color:#444;text-decoration:none;">Unsubscribe</a>
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: theme.subject, html };
}
