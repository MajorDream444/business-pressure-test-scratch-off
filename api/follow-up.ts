import { timingSafeEqual } from 'node:crypto';
import type { ApiRequest,ApiResponse } from './submit.js';
import { airtable,upsert } from '../shared/integrations.js';
import { nurtureReady,coachingEmail,followupTime } from '../shared/nurture.js';
import { httpsUrl } from '../shared/commerce.js';
function authorized(v:string){const want=`Bearer ${process.env.CRON_SECRET||''}`;return !!process.env.CRON_SECRET&&v.length===want.length&&timingSafeEqual(Buffer.from(v),Buffer.from(want));}
export default async function handler(req:ApiRequest,res:ApiResponse){
 res.setHeader('Cache-Control','no-store');
 if(!authorized(String(req.headers.authorization||'')))return res.status(401).json({error:'Unauthorized'});
 if(req.method!=='GET'&&req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!nurtureReady())return res.status(200).json({enabled:false,sent:0});
 const table=process.env.AIRTABLE_FOLLOWUP_TABLE_ID!,origin=new URL(process.env.APP_ORIGIN!).origin;
 let sent=0,suppressed=0;
 try{
  const now=new Date().toISOString();
  const formula=`AND({Status}="active",{Next Send At}<=${JSON.stringify(now)})`;
  const due=await airtable(`${table}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=3`);
  for(const record of due.records||[]){
   const f=record.fields,stage=Number(f.Stage||0),email=String(f.Email||'').toLowerCase();
   if(![0,1,2].includes(stage)||!email||!f['Consent At']||!f['Unsubscribe Token'])continue;
   const orders=await airtable(`${process.env.AIRTABLE_ORDERS_TABLE_ID}?filterByFormula=${encodeURIComponent(`AND(LOWER({Email})=${JSON.stringify(email)},{Payment Status}="paid")`)}&maxRecords=1`);
   if(orders.records?.length){await upsert(table,'Enrollment ID',{'Enrollment ID':f['Enrollment ID'],Status:'purchased'});suppressed++;continue;}
   const fresh=await airtable(`${table}/${record.id}`);if(fresh.fields.Status!=='active')continue;
   const unsubscribe=`${origin}/api/unsubscribe?token=${encodeURIComponent(f['Unsubscribe Token'])}`;
   const message=coachingEmail(stage,String(f.Name||'there'),origin,httpsUrl(process.env[`MAIM_VIDEO_${stage+1}_URL`]),unsubscribe);
   const r=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`maim-followup-${f['Enrollment ID']}-${stage}`},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL,to:[email],...message,headers:{'List-Unsubscribe':`<${unsubscribe}>`}})});
   if(!r.ok||!(await r.json()).id){await upsert(table,'Enrollment ID',{'Enrollment ID':f['Enrollment ID'],'Last Error':'Email provider did not accept message'});continue;}
   await upsert(table,'Enrollment ID',{'Enrollment ID':f['Enrollment ID'],Stage:stage+1,'Last Sent At':now,'Last Error':'',...(stage===2?{Status:'completed'}:{'Next Send At':followupTime(String(f['Consent At']),stage+1)})});sent++;
  }
  return res.status(200).json({enabled:true,sent,suppressed});
 }catch{return res.status(503).json({error:'Follow-up processing incomplete',sent,suppressed});}
}
