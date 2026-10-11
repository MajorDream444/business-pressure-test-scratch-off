import Stripe from 'stripe';
import type { IncomingMessage } from 'node:http';
import type { ApiRequest,ApiResponse } from './submit.js';
import { OFFER,paidOrder,stripeClient,httpsUrl } from '../shared/commerce.js';
import { airtable,upsert,syncContact,sendResultEmail } from '../shared/integrations.js';
export const config={api:{bodyParser:false}};
export default async function handler(req:ApiRequest & Partial<IncomingMessage>,res:ApiResponse) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 if(!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY || !process.env.AIRTABLE_ORDERS_TABLE_ID || !process.env.AIRTABLE_PAT || !process.env.AIRTABLE_CONTACTS_TABLE_ID) return res.status(503).json({error:'Payment sync unavailable'});
 let event:Stripe.Event;
 try {
  let raw:Buffer;
  if(Buffer.isBuffer(req.body)) raw=req.body;
  else {const chunks:Buffer[]=[];let size=0;for await(const chunk of req as IncomingMessage){size+=Buffer.byteLength(chunk);if(size>1000000) throw new Error();chunks.push(Buffer.from(chunk));}raw=Buffer.concat(chunks);}
  event=stripeClient().webhooks.constructEvent(raw,String(req.headers['stripe-signature']||''),process.env.STRIPE_WEBHOOK_SECRET);
 }catch{return res.status(400).json({error:'Invalid webhook signature'});}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) return res.status(200).json({received:true});
 try {
  const session=await stripeClient().checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id);
  if(!paidOrder(session)) return res.status(200).json({received:true,ignored:true});
  const email=session.customer_details?.email?.toLowerCase(), name=session.customer_details?.name||'MAIM participant';
  if(!email) throw new Error('Missing customer email');
  const table=process.env.AIRTABLE_ORDERS_TABLE_ID!;
  // Retrieve canonical Stripe state; never trust a success-page query or stale webhook payload.
  const prior=await airtable(`${table}?filterByFormula=${encodeURIComponent(`{Stripe Session ID}=${JSON.stringify(session.id)}`)}&maxRecords=1`);
  const old=prior.records?.[0]?.fields||{};
  const record=await upsert(table,'Stripe Session ID',{'Stripe Session ID':session.id,Email:email,Name:name,'Stripe Customer ID':typeof session.customer==='string'?session.customer:session.customer?.id||'','Stripe Payment Intent ID':typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id||'','Stripe Event ID':event.id,Offer:OFFER.name,'Payment Status':'paid','Amount Minor Units':session.amount_total,'Currency':session.currency,'Paid At':old['Paid At']||new Date().toISOString(),Livemode:String(session.livemode),...(!old['Fulfillment Status']?{'Fulfillment Status':'awaiting scheduling'}:{})});
  const contactId=await syncContact(email,name);
  const booking=httpsUrl(process.env.SHOP_BOOKING_URL);
  let emailStatus=record.fields['Receipt Email Status']==='sent'?'sent':await sendResultEmail(email,'Your MAIM Client System Blueprint — next steps',`Your payment for ${OFFER.name} has been confirmed.\n\n${OFFER.description}\n\nSchedule your review: ${booking}\n\nQuestions or changes: ${process.env.SHOP_SUPPORT_EMAIL}\n\nOrder reference: ${session.id}`, 'order-'+session.id);
  await upsert(table,'Stripe Session ID',{'Stripe Session ID':session.id,'Contact Record ID':contactId,'Receipt Email Status':emailStatus});
  if(emailStatus!=='sent') return res.status(503).json({error:'Order saved; confirmation email pending retry'});
  return res.status(200).json({received:true});
 }catch{return res.status(503).json({error:'Payment sync pending; please retry'});}
}
