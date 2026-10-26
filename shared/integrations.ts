import { contactsTableReady } from './table-policy.js';

export function captureReady() {
 return process.env.ENABLE_SUBMISSIONS === 'true' && !!process.env.AIRTABLE_PAT && !!process.env.AIRTABLE_BASE_ID;
}
export async function airtable(table: string, options: RequestInit = {}) {
 if (!process.env.AIRTABLE_PAT || !process.env.AIRTABLE_BASE_ID || !table) throw new Error('Records not configured');
 const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${table}`, {...options, headers: {Authorization: `Bearer ${process.env.AIRTABLE_PAT}`, 'Content-Type':'application/json'}, signal: AbortSignal.timeout(10000)});
 if (!response.ok) throw new Error(`Records unavailable (${response.status})`);
 return response.json();
}
export async function upsert(table: string, key: string, fields: Record<string, unknown>) {
 const data = await airtable(table,{method:'PATCH',body:JSON.stringify({performUpsert:{fieldsToMergeOn:[key]},records:[{fields}]})});
 if (!data.records?.[0]?.id) throw new Error('Missing saved reference');
 return data.records[0] as {id:string;fields:Record<string,unknown>};
}
export async function syncContact(email: string, name: string) {
 const table = process.env.AIRTABLE_CONTACTS_TABLE_ID;
 if (!table || !contactsTableReady()) throw new Error('Contacts table mapping is not safe');
 const formula = `LOWER({Email})=${JSON.stringify(email.toLowerCase())}`;
 const found = await airtable(`${table}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=2`);
 if (found.records?.length > 1) throw new Error('Duplicate contacts require review');
 // Existing operator-owned profile context is never overwritten.
 if (found.records?.[0]) return String(found.records[0].id);
 const record = await upsert(table, 'Email', {'Email':email.toLowerCase(),'Full Name':name});
 return record.id;
}
export async function sendResultEmail(email:string,subject:string,text:string,reference:string) {
 if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL.includes('resend.dev')) return 'not_configured';
 try {
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':reference},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL,to:[email],reply_to:process.env.RESEND_REPLY_TO||process.env.SHOP_SUPPORT_EMAIL,subject,text}),signal:AbortSignal.timeout(10000)});
  if (!r.ok || !(await r.json()).id) throw new Error();
  return 'sent';
 } catch { return 'failed'; }
}
