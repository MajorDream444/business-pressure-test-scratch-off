/**
 * Airtable schema setup script.
 * Run: npx tsx scripts/setup-airtable.ts
 * Requires AIRTABLE_PAT in .env.local
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const BASE_ID  = 'appJ1Vuz0rz8a2izs';
const TABLE_ID = 'tblYf3kEIWr0FxX2i';
const PAT      = process.env.AIRTABLE_PAT;

if (!PAT) {
  console.error('❌  AIRTABLE_PAT not set. Add it to .env.local and retry.');
  process.exit(1);
}

const HEADERS = {
  Authorization:  `Bearer ${PAT}`,
  'Content-Type': 'application/json',
};
const META = `https://api.airtable.com/v0/meta/bases/${BASE_ID}`;

// ── Field definitions ─────────────────────────────────────────────────────────

interface FieldSpec {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

const Q  = (n: number) => `Q${n}`;
const SQ = (n: number) => `Score Q${n}`;

const FIELDS_TO_CREATE: FieldSpec[] = [
  // Core
  { name: 'First Name',       type: 'singleLineText' },
  { name: 'Last Name',        type: 'singleLineText' },
  { name: 'Submission ID',    type: 'singleLineText' },
  { name: 'App Version',      type: 'singleLineText' },
  { name: 'Submitted At',     type: 'singleLineText' },
  { name: 'Raw Payload JSON', type: 'multilineText'  },

  // Business context
  { name: 'Business Type', type: 'singleLineText' },
  { name: 'Revenue Range', type: 'singleLineText' },
  { name: 'Biggest Issue', type: 'multilineText'  },

  // Quiz answers Q1–Q10
  ...[1,2,3,4,5,6,7,8,9,10].map(n => ({ name: Q(n),  type: 'singleLineText' })),

  // Per-question scores
  ...[1,2,3,4,5,6,7,8,9,10].map(n => ({
    name: SQ(n), type: 'number', options: { precision: 0 },
  })),

  // Total score
  { name: 'Total Score', type: 'number', options: { precision: 0 } },

  // Single selects
  {
    name: 'Score Band', type: 'singleSelect',
    options: { choices: ['Critical','Leaking','Unstable','Functional','Strong'].map(name => ({ name })) },
  },
  {
    name: 'Priority', type: 'singleSelect',
    options: { choices: ['HOT','WARM','COLD'].map(name => ({ name })) },
  },
  {
    name: 'Primary Leak', type: 'singleSelect',
    options: { choices: ['Lead Flow','Offer','Follow-up','Conversion','Operations','Delegation','Time Freedom'].map(name => ({ name })) },
  },
  { name: 'Diagnosis Summary', type: 'multilineText' },
  {
    name: 'Recommended Offer', type: 'singleSelect',
    options: { choices: ['Pressure Test','Diagnostic Call','System Build','Retainer','Not Ready'].map(name => ({ name })) },
  },
  { name: 'Next Step', type: 'singleLineText' },
];

const SELECT_UPDATES: Record<string, string[]> = {
  Source: ['business-pressure-test','Bali Spirit Festival','Black In Bali','Coffee Meeting','Google Meet','Referral','Manual'],
  Status: ['New','Reviewing','Qualified','Contacted','Booked','Won','Not Fit'],
};

// ── API helpers ───────────────────────────────────────────────────────────────

interface AirtableChoice { id?: string; name: string; color?: string; }
interface AirtableField  { id: string; name: string; type: string; options?: { choices?: AirtableChoice[] }; }

async function fetchFields(): Promise<AirtableField[]> {
  const res  = await fetch(`${META}/tables`, { headers: HEADERS });
  if (!res.ok) throw new Error(`fetchFields: ${await res.text()}`);
  const data = await res.json() as { tables: { id: string; fields: AirtableField[] }[] };
  const tbl  = data.tables.find(t => t.id === TABLE_ID);
  if (!tbl) throw new Error(`Table ${TABLE_ID} not found in base`);
  return tbl.fields;
}

async function createField(spec: FieldSpec) {
  const res  = await fetch(`${META}/tables/${TABLE_ID}/fields`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(spec),
  });
  const data = await res.json();
  if (!res.ok) console.warn(`  ⚠  "${spec.name}": ${JSON.stringify(data?.error ?? data)}`);
  else         console.log( `  ✅ Created  "${spec.name}" (${spec.type})`);
}

async function patchSelectChoices(field: AirtableField, desired: string[]) {
  const existing     = field.options?.choices ?? [];
  const existingSet  = new Set(existing.map(c => c.name));
  const toAdd        = desired.filter(n => !existingSet.has(n)).map(name => ({ name }));

  if (!toAdd.length) {
    console.log(`  ✓  "${field.name}" — all choices present`);
    return;
  }

  const res  = await fetch(`${META}/tables/${TABLE_ID}/fields/${field.id}`, {
    method: 'PATCH', headers: HEADERS,
    body: JSON.stringify({ options: { choices: [...existing, ...toAdd] } }),
  });
  const data = await res.json();
  if (!res.ok) console.warn(`  ⚠  "${field.name}": ${JSON.stringify(data?.error ?? data)}`);
  else         console.log( `  ✅ Updated  "${field.name}" — added: ${toAdd.map(c => c.name).join(', ')}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍  Fetching current table schema…\n');
  const existing     = await fetchFields();
  const existingNames = new Set(existing.map(f => f.name));
  console.log(`    Found ${existing.length} existing fields.\n`);

  console.log('➕  Creating missing fields…');
  for (const spec of FIELDS_TO_CREATE) {
    if (existingNames.has(spec.name)) {
      console.log(`  ✓  "${spec.name}" — already exists`);
    } else {
      await createField(spec);
    }
  }

  console.log('\n🔄  Updating select options…');
  for (const [fieldName, desired] of Object.entries(SELECT_UPDATES)) {
    const field = existing.find(f => f.name === fieldName);
    if (!field) { console.warn(`  ⚠  "${fieldName}" not found — skipping`); continue; }
    await patchSelectChoices(field, desired);
  }

  console.log('\n🎉  Schema setup complete!\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
