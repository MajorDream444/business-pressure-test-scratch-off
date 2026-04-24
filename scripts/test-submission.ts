/**
 * Direct Airtable write test — bypasses Vercel endpoint.
 * Run: npx tsx scripts/test-submission.ts
 * Requires AIRTABLE_PAT in .env.local
 */
import dotenv from 'dotenv';
dotenv.config({ path: 'env/.env.local' });
dotenv.config({ path: '.env.local' });
dotenv.config();

const BASE_ID  = 'appJ1Vuz0rz8a2izs';
const TABLE_ID = 'tblYf3kEIWr0FxX2i';
const PAT      = process.env.AIRTABLE_PAT;

if (!PAT) {
  console.error('❌  AIRTABLE_PAT not set. Add it to .env.local and retry.');
  process.exit(1);
}

const fields: Record<string, string | number> = {
  'Name':              'Claude Test Run',
  'First Name':        'Claude',
  'Last Name':         'Test Run',
  'Email':             'test@bpt.app',
  'Telegram_or_Phone': '@claude_test',
  'Source':            'business-pressure-test',
  'Submitted At':      new Date().toISOString(),
  'App Version':       'v2',
  'Submission ID':     `bpt_test_${Date.now()}`,
  'Business Type':     'Agency / Service Business',
  'Revenue Range':     '$5k – $15k / month',
  'Biggest Issue':     'Lead flow is inconsistent and revenue is unpredictable month to month',
  'Q1':  'Random referrals or word of mouth only',
  'Q2':  'Most things would slow down badly',
  'Q3':  'My offer is decent, but inconsistent in conversion',
  'Q4':  'Some weeks yes, some weeks no',
  'Q5':  'I do it manually when I remember',
  'Q6':  'Some parts are organized, most are not',
  'Q7':  'I have a rough idea',
  'Q8':  'Very little',
  'Q9':  'I feel the problem, but cannot clearly define it',
  'Q10': 'It would be stressful and messy',
  'Score Q1':  0,
  'Score Q2':  2.5,
  'Score Q3':  5,
  'Score Q4':  2.5,
  'Score Q5':  2.5,
  'Score Q6':  2.5,
  'Score Q7':  2.5,
  'Score Q8':  2.5,
  'Score Q9':  2.5,
  'Score Q10': 2.5,
  'Score':       25,
  'Total Score': 25,
  'Score Band':  'Critical',
  'Priority':    'HOT',
  'Primary Leak':      'Lead Flow',
  'Diagnosis Summary': 'Business depends heavily on daily effort. If you stop, most things slow down or break.',
  'Recommended Offer': 'Diagnostic Call',
  'Next Step':         'Clarify one core offer',
  'Raw Payload JSON':  JSON.stringify({ _test: true, ts: new Date().toISOString() }),
};

async function main() {
  console.log('🧪  Sending test record directly to Airtable…\n');
  console.log('AIRTABLE PAYLOAD:', JSON.stringify(fields, null, 2));

  const res  = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }] }),
  });

  const data = await res.json() as { records?: { id: string; fields: Record<string, unknown> }[]; error?: unknown };

  if (!res.ok) {
    console.error('\n❌  Airtable error:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const record    = data.records![0];
  const populated = Object.keys(record.fields);
  console.log(`\n✅  Record created: ${record.id}`);
  console.log(`📊  Fields returned by Airtable (${populated.length}):`, populated.join(', '));
  console.log('\n🎉  Test passed — check Airtable for the new row.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
