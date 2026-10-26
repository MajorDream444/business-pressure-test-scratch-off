import Stripe from 'stripe';
import {googleBookingUrl} from './google-booking.js';
import {BLUEPRINT_SCOPE_VERSION} from './delivery.js';
import {contactsTableReady} from './table-policy.js';
export {BLUEPRINT_SCOPE_VERSION};
export function checkoutPolicyReady(){return process.env.CHECKOUT_TERMS_APPROVED==='true' && !!httpsUrl(process.env.SHOP_TERMS_URL) && !!process.env.SHOP_AGREEMENT_VERSION;}
export const MERCHANT='AMA Solutions Corporation';
export const OFFER = {sku:'MAIM-BLUEPRINT-001', name:'Client System Blueprint', amount:25000, currency:'usd', description:'A 30–45 minute review, a one-page system map, three priorities, and a first client-flow blueprint.'};
export function stripeClient() { return new Stripe(process.env.STRIPE_SECRET_KEY!,{timeout:10000,maxNetworkRetries:1}); }
export function shopReady() { return process.env.ENABLE_CHECKOUT==='true' && checkoutPolicyReady() && !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_BLUEPRINT_PRICE_ID && !!process.env.STRIPE_WEBHOOK_SECRET && !!process.env.AIRTABLE_PAT && !!process.env.AIRTABLE_BASE_ID && !!process.env.AIRTABLE_ORDERS_TABLE_ID && contactsTableReady() && !!googleBookingUrl(process.env.SHOP_BOOKING_URL) && !!process.env.SHOP_SUPPORT_EMAIL && !!httpsUrl(process.env.APP_ORIGIN) && !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('resend.dev') && ['test','live'].includes(process.env.STRIPE_MODE||''); }
export function httpsUrl(value:string|undefined) {try {const u=new URL(value||'');return u.protocol==='https:'?u.href:'';}catch{return '';}}
export function paidOrder(session:Stripe.Checkout.Session) {
 if(session.metadata?.sku!==OFFER.sku || session.mode!=='payment' || session.payment_status!=='paid') return false;
 if(session.currency!==OFFER.currency || session.amount_subtotal!==OFFER.amount) throw new Error('Order amount mismatch');
 if(session.livemode !== (process.env.STRIPE_MODE==='live')) throw new Error('Mode mismatch');
 return true;
}
