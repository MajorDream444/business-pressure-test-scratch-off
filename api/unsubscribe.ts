import type { IncomingMessage,ServerResponse } from 'node:http';
import type { ApiRequest,ApiResponse } from './submit.js';
import { airtable,upsert } from '../shared/integrations.js';
export default async function handler(req:ApiRequest & Partial<IncomingMessage>,res:ApiResponse & Partial<ServerResponse>){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 const token=new URL(req.url||'','https://maim.invalid').searchParams.get('token');
 if(!token||!/^[a-f0-9]{64}$/.test(token))return res.status(400).json({error:'Invalid unsubscribe link'});
 if(!process.env.AIRTABLE_FOLLOWUP_TABLE_ID||!process.env.AIRTABLE_PAT)return res.status(503).json({error:'Please contact artmobagi@gmail.com to stop follow-up emails.'});
 if(req.method==='GET'){
  res.setHeader('Content-Type','text/html;charset=utf-8');res.status(200);
  return res.end?.(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stop MAIM coaching emails</title><body style="font:18px/1.7 Arial;background:#050505;color:#f7f4ea;padding:40px"><h1>Choose what reaches your inbox.</h1><p>Stop the optional MAIM coaching sequence. This does not cancel purchases or essential order emails.</p><form method="post" action="/api/unsubscribe?token=${token}"><button style="padding:16px;font-size:18px">Unsubscribe from coaching emails</button></form></body></html>`);
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const table=process.env.AIRTABLE_FOLLOWUP_TABLE_ID;
  const records=await airtable(`${table}?filterByFormula=${encodeURIComponent(`{Unsubscribe Token}=${JSON.stringify(token)}`)}&maxRecords=1`);
  if(records.records?.[0])await upsert(table,'Enrollment ID',{'Enrollment ID':records.records[0].fields['Enrollment ID'],Status:'unsubscribed'});
  res.setHeader('Content-Type','text/html;charset=utf-8');res.status(200);
  return res.end?.('<!doctype html><html lang="en"><title>MAIM unsubscribe confirmed</title><body style="font:18px/1.7 Arial;padding:40px"><h1>Your coaching emails have stopped.</h1><p>You can still use the assessments and receive essential purchase emails.</p><a href="/">Return to MAIM</a></body></html>');
 }catch{return res.status(503).json({error:'We could not confirm the change. Please retry or contact artmobagi@gmail.com.'});}
}
