import { enroll } from '../shared/nurture.js';
import { createHash } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './submit.js';
import { allowRequest } from './submit.js';
import { validChallenge } from '../shared/server-protection.js';
import { CHOICES, CONTINUITY_VERSION, continuityResult, continuityReport } from '../shared/continuity.js';
import type { ContinuityAnswer } from '../shared/continuity.js';
import { captureReady, upsert, syncContact, sendResultEmail } from '../shared/integrations.js';
export default async function handler(req:ApiRequest,res:ApiResponse) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 if(!captureReady() || !process.env.AIRTABLE_ASSESSMENTS_TABLE_ID || !process.env.AIRTABLE_CONTACTS_TABLE_ID) return res.status(503).json({error:'Saving is not available yet. Download your plan instead.'});
 let b:Record<string,unknown>;
 try {
  if(String(req.headers.origin||'') && new URL(String(req.headers.origin)).host !== String(req.headers.host)) throw new Error();
  if(JSON.stringify(req.body).length>10000) throw new Error();
  b=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!b || b.consent!==true || b.website || !validChallenge(String(b.challenge||''),process.env.AIRTABLE_PAT!)) throw new Error();
  if(typeof b.name!=='string' || !b.name.trim() || b.name.length>160 || /[\x00-\x1f]/.test(b.name)) throw new Error();
  if(typeof b.email!=='string' || b.email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(b.email)) throw new Error();
  if(typeof b.submissionId!=='string' || !/^[a-f0-9-]{36}$/.test(b.submissionId)) throw new Error();
  if(typeof b.action!=='string' || !b.action.trim() || b.action.length>1500 || typeof b.note!=='string' || b.note.length>1200) throw new Error();
  if(!Array.isArray(b.answers) || b.answers.some(a=>!CHOICES.includes(a))) throw new Error();
  continuityResult(b.answers as ContinuityAnswer[]);
 } catch {return res.status(400).json({error:'Please check your details and refresh the save form.'});}
 if(!allowRequest('continuity:'+createHash('sha256').update(String(req.headers['x-forwarded-for']||'unknown').split(',')[0]).digest('hex'))) return res.status(429).json({error:'Please wait a minute before trying again.'});
 const email=String(b.email).trim().toLowerCase(), name=String(b.name).trim();
 const id='continuity_'+createHash('sha256').update(JSON.stringify({id:b.submissionId,email,name,answers:b.answers,action:b.action,note:b.note})).digest('hex');
 try {
  const record=await upsert(process.env.AIRTABLE_ASSESSMENTS_TABLE_ID!,'Submission ID',{'Submission ID':id,Name:name,Email:email,'Assessment Version':CONTINUITY_VERSION,'Answers JSON':JSON.stringify(b.answers),'Action Plan':`${b.action}\n${b.note}`});
  let contactStatus='synced',contactId='';
  try {contactId=await syncContact(email,name);} catch {contactStatus='pending';}
  const report=continuityReport(b.answers as ContinuityAnswer[],String(b.action),String(b.note),new Date().toISOString().slice(0,10));
  const emailStatus=record.fields['Results Email Status']==='sent'?'sent':await sendResultEmail(email,'Your MAIM continuity plan',report,id);
  const consentAt=record.fields['Consent At']||new Date().toISOString();
  await upsert(process.env.AIRTABLE_ASSESSMENTS_TABLE_ID!,'Submission ID',{'Submission ID':id,'Consent At':consentAt,...(contactId?{'Contact Record ID':contactId}:{}),'Results Email Status':emailStatus});
  let followupStatus='not_requested';
  if(b.marketingConsent===true){try{await enroll(email,name,'founder-continuity');followupStatus='enrolled';}catch{followupStatus='pending';}}
  return res.status(200).json({saved:true,emailStatus,contactStatus,followupStatus,submissionId:id});
 } catch { return res.status(502).json({error:'We could not confirm the save. Retry uses the same reference.'}); }
}
