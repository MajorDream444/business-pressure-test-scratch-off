import type { ApiRequest,ApiResponse } from './submit.js';
import { allowRequest } from './submit.js';
import { createHash } from 'node:crypto';
import { OFFER,shopReady,stripeClient,httpsUrl } from '../shared/commerce.js';
export default async function handler(req:ApiRequest,res:ApiResponse) {
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET') return res.status(200).json({available:!!shopReady(),offer:OFFER});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
 if(!shopReady()) return res.status(503).json({error:'Checkout is being prepared. Your free results remain available.'});
 try {
  const origin=new URL(process.env.APP_ORIGIN!).origin;
  if(String(req.headers.origin)!==origin || String(req.headers.host)!==new URL(origin).host) return res.status(403).json({error:'Please start checkout from this site.'});
  const ip=createHash('sha256').update(String(req.headers['x-forwarded-for']||'unknown').split(',')[0]).digest('hex');
  if(!allowRequest('checkout:'+ip)) return res.status(429).json({error:'Please wait a minute before trying again.'});
  const b=(typeof req.body==='string'?JSON.parse(req.body):req.body) as Record<string,unknown>;
  if(!b || typeof b.requestId!=='string' || !/^[a-f0-9-]{36}$/.test(b.requestId)) return res.status(400).json({error:'Please refresh and try again.'});
  const stripe=stripeClient();
  const price=await stripe.prices.retrieve(process.env.STRIPE_BLUEPRINT_PRICE_ID!,{expand:['product']});
  const product=price.product as StripeProduct;
  if(!price.active || price.type!=='one_time' || price.unit_amount!==OFFER.amount || price.currency!==OFFER.currency || !product.active || product.metadata?.sku!==OFFER.sku || price.livemode!==(process.env.STRIPE_MODE==='live')) throw new Error();
  const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price:price.id,quantity:1}],customer_creation:'always',metadata:{sku:OFFER.sku,source:'maim-assessments'},success_url:`${origin}/?checkout=returned`,cancel_url:`${origin}/?checkout=cancelled`,custom_text:{submit:{message:'Includes a 30–45 minute review and a one-page blueprint. Scheduling is arranged after purchase.'}}},{idempotencyKey:'maim-checkout-'+b.requestId});
  if(!httpsUrl(session.url||'')) throw new Error();
  return res.status(200).json({url:session.url});
 }catch{return res.status(502).json({error:'Checkout could not be opened. Please try again.'});}
}
type StripeProduct={active:boolean;metadata:Record<string,string>};
