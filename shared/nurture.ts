import { createHash,randomBytes } from 'node:crypto';
import { airtable,upsert } from './integrations.js';
import { httpsUrl } from './commerce.js';
export const FOLLOWUP_DAYS=[1,3,7];
export function followupTime(consentAt:string,stage:number) { if(stage<0||stage>2)throw new Error('Invalid stage');return new Date(Date.parse(consentAt)+FOLLOWUP_DAYS[stage]*86400000).toISOString(); }
export function nurtureReady(){return APPROVED_COACHING_EMAILS.length===3 && process.env.ENABLE_NURTURE==='true' && !!process.env.AIRTABLE_PAT && !!process.env.AIRTABLE_BASE_ID && !!process.env.AIRTABLE_FOLLOWUP_TABLE_ID && !!process.env.AIRTABLE_ORDERS_TABLE_ID && !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev') && !!httpsUrl(process.env.APP_ORIGIN) && !!process.env.MAILING_ADDRESS && !!process.env.SHOP_SUPPORT_EMAIL;}
export async function enroll(email:string,name:string,source:string) {
 if(!process.env.AIRTABLE_FOLLOWUP_TABLE_ID)throw new Error('Follow-up not configured');
 const id=createHash('sha256').update(email.toLowerCase()).digest('hex');
 const table=process.env.AIRTABLE_FOLLOWUP_TABLE_ID;
 const prior=await airtable(`${table}?filterByFormula=${encodeURIComponent(`{Enrollment ID}=${JSON.stringify(id)}`)}&maxRecords=1`);
 // Do not restart completed, unsubscribed or purchased enrollments on another assessment.
 if(prior.records?.[0]) return;
 const now=new Date().toISOString();
 await upsert(table,'Enrollment ID',{'Enrollment ID':id,Email:email.toLowerCase(),Name:name,'Consent At':now,Source:source,Stage:0,'Next Send At':followupTime(now,0),Status:'active','Unsubscribe Token':randomBytes(32).toString('hex')});
}
// Founder interview pending. No coaching copy is approved for sending.
export const APPROVED_COACHING_EMAILS: {subject:string;body:string}[] = [];
export function coachingEmail(stage:number,name:string,origin:string,video:string,unsubscribe:string) {
 const content=APPROVED_COACHING_EMAILS[stage];
 if(!content)throw new Error('Founder email copy is awaiting approval');
 return {subject:content.subject,text:[content.body.replaceAll('{name}',name),video?`A short video from Major: ${video}`:'',`Your assessments: ${origin}`,`Questions: ${process.env.SHOP_SUPPORT_EMAIL}`,`Unsubscribe: ${unsubscribe}`,process.env.MAILING_ADDRESS||''].filter(Boolean).join('\n\n')};
}
