/**
 * End-to-end check of the submit endpoint (validation, save, dedupe, email).
 *
 * Local:   npm run dev   (in another terminal), then
 *          npx tsx scripts/test-endpoint.ts
 * Staging: TEST_URL=https://<deployment>.vercel.app/api/submit \
 *          VERCEL_AUTOMATION_BYPASS_SECRET=<secret> \
 *          TEST_EMAIL=you@yourdomain.com npx tsx scripts/test-endpoint.ts
 *
 * Writes ONE real test row to Airtable (and sends one email if Resend is configured).
 */
import { QUESTIONS } from '../src/constants.js';
import { BIZ_TYPES, REVENUE_RANGES, scoreSubmission } from '../src/scoring.js';

const URL_ = process.env.TEST_URL ?? 'http://localhost:3000/api/submit';
const EMAIL = process.env.TEST_EMAIL ?? 'bpt-test@example.com';
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

const answers: Record<string, string> = {};
QUESTIONS.forEach((q, i) => { answers[`q${i + 1}`] = q.options[1].label; });
const expected = scoreSubmission(answers)!;

const payload = {
  submissionId: `bpt_test_${Date.now()}`,
  firstName: 'Test',
  lastName: 'Run',
  email: EMAIL,
  telegramOrPhone: '@bpt_test',
  businessType: BIZ_TYPES[2],
  revenueRange: REVENUE_RANGES[3],
  biggestIssue: 'Endpoint test — <b>html</b> should be escaped in the email',
  answers,
  // Forged values the server must ignore:
  totalScore: 100,
  scoreBand: 'Strong',
  priority: 'COLD',
};

async function post(body: unknown) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
    },
    body: JSON.stringify(body),
  });
  let json: unknown = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json: json as Record<string, unknown> | null };
}

let failed = 0;
function check(label: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? '✅' : '❌'}  ${label}${ok ? '' : `  →  ${JSON.stringify(detail)}`}`);
  if (!ok) failed++;
}

async function main() {
  console.log(`Target: ${URL_}\nExpected server-side score: ${expected.totalScore} (${expected.scoreBand}, ${expected.priority})\n`);

  const first = await post(payload);
  check('valid submission saved (200, success)', first.status === 200 && first.json?.success === true, first);
  console.log(`    email status: ${first.json?.email}   requestId: ${first.json?.requestId}`);

  const retry = await post(payload);
  check('retry with same submissionId is deduped', retry.status === 200 && retry.json?.duplicate === true, retry);

  const badAnswer = await post({ ...payload, submissionId: `bpt_test_${Date.now()}b`, answers: { ...answers, q1: 'not a real option' } });
  check('unknown answer label rejected (400)', badAnswer.status === 400, badAnswer);

  const badEmail = await post({ ...payload, submissionId: `bpt_test_${Date.now()}c`, email: 'nope' });
  check('invalid email rejected (400)', badEmail.status === 400, badEmail);

  console.log('\nNow open Airtable and confirm the new "Test Run" row shows:');
  console.log(`  Total Score = ${expected.totalScore} (NOT 100), Score Band = ${expected.scoreBand}, Priority = ${expected.priority}, Email Status filled in.`);
  console.log('  Check the inbox for the results email: the biggest-issue text should appear as literal "<b>html</b>".');
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
