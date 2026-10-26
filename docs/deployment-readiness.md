# MAIM assessments — release readiness, 11 October 2026

## Implemented
- Branded assessment hub: Business Pressure Test + Founder Continuity Check.
- Continuity results, action selection, optional notes, plain-text download and browser Print / save PDF.
- Separate consented continuity capture and contact matching by normalized email.
- Existing Business Pressure Test capture retains scoring and adds contact reference sync.
- Existing client profiles and operator context are preserved. Ambiguous duplicate emails are flagged for review instead of merged.
- Server-created Stripe Checkout for the approved one-time USD $250 blueprint. Browser cannot set price or paid state.
- Signed raw-body webhook verifies canonical paid session, amount, currency, mode, order/contact sync, and confirmation email.
- Orders deduplicate by Stripe Session ID. Human fulfillment status is preserved on retries.
- Optional three-email enrollment, purchase suppression, unsubscribe confirmation and protected follow-up processor.

## Verified account resources
Vercel HAMAL AGI / business-pressure-test, Node 24, protected preview only.
Stripe M.A.I.M. account acct_1TLgn2BaiziDnHMm, live product prod_VQ3PnQKlO2DtQu and live price price_1UPDJ5BaiziDnHMmtX8KZObp, USD 250. No charges or checkout sessions created by this work.

Airtable AMA MOB OS V2 appJ1Vuz0rz8a2izs:
- Existing leads tblYf3kEIWr0FxX2i, added Contact Record ID only.
- Existing Client Profiles tblWA2OJMcMrOtDkE, preserve existing records and context.
- New MAIM Assessment Responses tbl8XPHZ1eK3l9jbW.
- New MAIM Orders tblarNdHdlxOYIVoA.
- New MAIM Follow-up Queue tbl1pPhCa6bx3ST3E.

New table/price mappings configured for preview/development only. Feature flags disabled. No production variables or domains changed.

The mapping is now enforced in code: `tbl1pPhCa6bx3ST3E` is the MAIM Follow-up Queue and is rejected if configured as Contacts, lead capture, assessment responses, or orders. Contacts remain Client Profiles `tblWA2OJMcMrOtDkE`. The launch check reports role validity without printing table values or credentials.

## Still needed to activate integrations
The Vercel project had no AIRTABLE_PAT, RESEND_API_KEY or verified RESEND_FROM_EMAIL at inspection. No Stripe secret or webhook signing secret is configured by this work. Owner must enter secrets directly into Vercel Settings → Environment Variables; do not put them in chat or git.

For protected preview testing: AIRTABLE_PAT with record read/write for this base; Resend key and verified sender; a Stripe sandbox key, matching test price, test webhook secret; canonical APP_ORIGIN; real SHOP_BOOKING_URL and support contact. Keep live and test keys/prices/endpoints separate. Existing live product is prepared, not evidence of tested payment fulfillment.

1. Enable capture in protected preview and submit one consented test per assessment.
2. Verify one assessment row plus one normalized contact reference, exact fractional BPT scores, consent and an actual received results email.
3. Configure a Stripe test webhook endpoint to `/api/stripe-webhook` for checkout.session.completed and checkout.session.async_payment_succeeded. Protected Vercel previews need a reviewed machine-access route for Stripe; do not disable protection to work around it.
4. Set matching test credentials/price, mode test, booking route and APP_ORIGIN. Enable checkout only after webhook delivery works.
5. Complete a test payment; verify one order, contact sync and actual scheduling email. Replay event and check no duplicate row or reset of fulfillment state. Unpaid sessions cannot fulfill.
6. Review scheduling capacity, cancellations/refunds and tax configuration before offering the live service. The integration does not automatically process refunds, disputes or delivery of the human blueprint; reconcile these in Stripe and the fulfillment queue. Confirm a receipt/confirmation contact process.
7. For public capture, configure shared rate limiting or reviewed Vercel Firewall controls. Instance throttles alone are insufficient.

One bounded protected-preview procedure is specified in `docs/bpt-external-qa-packet-2026-10-27.md`. It is a test plan, not evidence that external QA ran.

## Coaching automation intentionally paused
Major asked to be interviewed before email copy is written. APPROVED_COACHING_EMAILS is empty; nurtureReady therefore returns false even if the feature flag is enabled. No existing contacts were enrolled or emailed.

Prepared cadence: immediate transactional results; optional coaching on days 1, 3 and 7 from explicit opt-in. No automatic restart for completed/unsubscribed/purchased enrollments. Purchase suppression checks MAIM Orders; outside purchases require reconciliation. Emails sent just before a purchase reaches the order table may still arrive.

Before activation: founder-approved copy, real video links if used, verified sender, accurate mailing address, secret-authenticated scheduler and unsubscribe/purchase replay checks. `/api/follow-up` is prepared but no Vercel Cron schedule was installed. Small batches (3) limit function work; a production shared queue is advisable for higher volume. Resend idempotency has a finite retention window; monitor failed state persistence and reconcile rather than promising permanent exactly-once sending.

## Founder interview
Chosen direction: help people act; a personal business-dependency lesson; map the next step together.
Pending: Major's natural spoken/written words and a specific lived story. Do not turn the direction choices into attributed quotations.

## Evidence separation
No Theo/Sheetal private notes, identities or client quotes are included in frontend assets. Shared assessment wording is educational. No research reuse is authorized by save consent, purchase or coaching opt-in.
