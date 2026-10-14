import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { paidOrder,shopReady,checkoutPolicyReady } from '../shared/commerce';
import { syncContact } from '../shared/integrations';
import shop from '../api/shop';
import webhook from '../api/stripe-webhook';
const env={...process.env};
const fetchOriginal=global.fetch;
function response(){const r={code:0,body:{} as any,status(c:number){this.code=c;return this;},json(b:any){this.body=b;return b;},setHeader(){}};return r;}
test('checkout is disabled when required integration settings are missing',async()=>{
 delete process.env.ENABLE_CHECKOUT;
 assert.equal(shopReady(),false);
 const r=response();await shop({method:'POST',body:{},headers:{}},r);
 assert.equal(r.code,503);
});
test('unpaid or unrelated Stripe sessions never become paid orders; currency, amount and mode are checked',()=>{
 process.env.STRIPE_MODE='test';
 const s={metadata:{sku:'MAIM-BLUEPRINT-001'},mode:'payment',payment_status:'paid',currency:'usd',amount_subtotal:25000,livemode:false} as unknown as Stripe.Checkout.Session;
 assert.equal(paidOrder(s),true);
 assert.equal(paidOrder({...s,payment_status:'unpaid'}),false);
 assert.equal(paidOrder({...s,metadata:{sku:'other'}}),false);
 assert.throws(()=>paidOrder({...s,amount_subtotal:100}));
 assert.throws(()=>paidOrder({...s,livemode:true}));
 assert.throws(()=>paidOrder({...s,currency:'eur'}));
 process.env= {...env};
});
test('contact sync preserves existing human-owned profiles and flags ambiguous duplicates',async()=>{
 process.env.AIRTABLE_PAT='fake';process.env.AIRTABLE_BASE_ID='appTest';process.env.AIRTABLE_CONTACTS_TABLE_ID='tblTest';
 let calls=0;
 global.fetch=async()=>{calls++;return new Response(JSON.stringify({records:[{id:'recExisting',fields:{'Full Name':'Operator-owned name'}}]}));};
 assert.equal(await syncContact('person@example.com','New name'),'recExisting');assert.equal(calls,1);
 global.fetch=async()=>new Response(JSON.stringify({records:[{id:'one'},{id:'two'}]}));
 await assert.rejects(syncContact('person@example.com','New name'));
 process.env={...env};global.fetch=fetchOriginal;
});
test('webhook rejects forged and parsed bodies, and acknowledges a valid unrelated event without a write',async()=>{
 process.env.STRIPE_SECRET_KEY='sk_test_fake';process.env.STRIPE_WEBHOOK_SECRET='whsec_test';process.env.AIRTABLE_PAT='fake';process.env.AIRTABLE_ORDERS_TABLE_ID='tblTest';process.env.AIRTABLE_CONTACTS_TABLE_ID='tblContacts';
 const payload=JSON.stringify({id:'evt_test',type:'customer.created',data:{object:{id:'cus_test'}}});
 const signature=Stripe.webhooks.generateTestHeaderString({payload,secret:'whsec_test'});
 let r=response();await webhook({method:'POST',body:Buffer.from(payload),headers:{'stripe-signature':'forged'}},r);assert.equal(r.code,400);
 r=response();await webhook({method:'POST',body:JSON.parse(payload),headers:{'stripe-signature':signature}},r);assert.equal(r.code,400);
 r=response();await webhook({method:'POST',body:Buffer.from(payload),headers:{'stripe-signature':signature}},r);assert.equal(r.code,200);
 process.env={...env};
});

test('checkout policy stays gated until approved HTTPS terms and version exist',()=>{
 process.env.CHECKOUT_TERMS_APPROVED='false';process.env.SHOP_TERMS_URL='https://example.com/terms';process.env.SHOP_AGREEMENT_VERSION='v1';assert.equal(checkoutPolicyReady(),false);
 process.env.CHECKOUT_TERMS_APPROVED='true';process.env.SHOP_TERMS_URL='http://example.com/terms';assert.equal(checkoutPolicyReady(),false);
 process.env.SHOP_TERMS_URL='https://example.com/terms';assert.equal(checkoutPolicyReady(),true);process.env={...env};
});
