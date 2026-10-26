import {googleBookingUrl} from '../shared/google-booking.js';
import {checkoutPolicyReady,shopReady} from '../shared/commerce.js';
import {contactsTableReady,tableRoleIssues} from '../shared/table-policy.js';
const required=['AIRTABLE_PAT','AIRTABLE_BASE_ID','AIRTABLE_CONTACTS_TABLE_ID','AIRTABLE_ORDERS_TABLE_ID','RESEND_API_KEY','RESEND_FROM_EMAIL','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_BLUEPRINT_PRICE_ID','APP_ORIGIN'];
const checks=required.map(key=>({setting:key,ready:key==='AIRTABLE_CONTACTS_TABLE_ID'?contactsTableReady():!!process.env[key]}));
checks.push({setting:'Google booking route',ready:!!googleBookingUrl(process.env.SHOP_BOOKING_URL)},{setting:'Reviewed purchase terms',ready:checkoutPolicyReady()},{setting:'Checkout configuration and flag',ready:!!shopReady()});
checks.push({setting:'Airtable table role mapping',ready:tableRoleIssues().length===0});
// Values, addresses, credentials and tokens are never printed.
for(const x of checks)console.log(`${x.ready?'READY':'MISSING'} ${x.setting}`);
console.log('Provider round trips, browser QA and approved policies require separate evidence.');
process.exitCode=checks.every(x=>x.ready)?0:1;
