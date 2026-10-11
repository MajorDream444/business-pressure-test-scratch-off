# MAIM Business Pressure Test

A ten-question diagnostic for Major AI Mindset. It turns self-reported operating structure into visible pressure signals and one practical next action. No email is needed to see results.

## Run and verify

Node 22 or 24. `npm ci`, then `npm run dev` (http://localhost:3000).

`npm run check` runs TypeScript, the diagnostic/API tests, and the Vite build. Tests mock external providers: they do not create real records or send emails.

The Express development server calls the same `/api/submit` and `/api/challenge` handlers as Vercel. Configure private values in an untracked `.env.local`, using `.env.example` as the key inventory.

## Sources

- MAIM brand: MajorDream444/Major-AI-OS, DESIGN.md v2.3 and data/design-tokens.json.
- Official MAIM seal copied intact from the MAIM client workspace skill asset. Do not redraw or recolor it.
- Airtable: AMA MOB OS V2 / MAJOR PRIME – LEADS.
- Implementation: this repository. `business-pressure-test-v2` is a separate planning scaffold.

## Capture behavior

Capture is disabled unless `ENABLE_SUBMISSIONS=true` and Airtable settings are present. The result screen always remains usable and printable. Only configure capture after live provider tests and deployment protection have been reviewed.

When enabled, saving requires explicit consent, complete answer indices, valid contact fields, a signed short-lived form challenge, an empty honeypot, and a same-origin request. Scores and diagnoses are computed on the server; supplied totals or priorities are ignored. Readiness determines lead priority independently of the diagnostic score.

Airtable PATCH upserts on a stable Submission ID derived from the browser run reference and normalized submission content. Identical retries update one row; changed answers or contact content create a different reference. The browser run reference lives in memory, so a new tab/reload starts a new run.

Resend sends are awaited with a 10-second timeout and an idempotency key. Email status is persisted separately in `Results Email Status` and `Results Email Updated At`; operator Notes are untouched. `sent` means provider acceptance, not confirmed delivery. A saved record with failed email remains saved and allows retry. Already accepted emails are not sent again if their status was persisted.

Throttle: six POST attempts per IP per minute per function instance, plus form challenge/honeypot. This is a basic guard, not a global limit: production requires a reviewed Vercel Firewall rate-limit rule or a shared limiter. Form challenges alone are not bot protection. Do not expose capture publicly without this production control.

## Staging and deployment

The only authorized release target for this iteration is protected staging in Vercel team HAMAL AGI, project business-pressure-test (`prj_kat96PeUmiWkNRDjAbtQkoYU4NV5`). Production and domain migration are excluded.

Vercel: framework Vite; install `npm ci`; build `npm run build`; output `dist`. Functions use the Node runtime. Static assets are served before the SPA fallback; API routes are excluded from it.

Required for lead saving: `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`, and the capture feature flag. The PAT needs record read/write access to the base for upsert verification and record operations. Do not grant broader access than needed.

For email: `RESEND_API_KEY` and `RESEND_FROM_EMAIL` with a verified sender. The resend.dev test sender is rejected by this app. Set the real HTTPS booking link in `VITE_CALENDLY_URL` only when ready; missing/invalid links hide the booking action. There is no Gumroad or $100 credit promise in this release.

## Airtable schema and ownership

Existing field names and select choices are retained. `Primary Leak` uses only current approved choices (Lead Flow, Offer, Follow-up, Operations, Delegation, Time Freedom). Exact fractional scores are preserved in Raw Payload JSON, on-screen output, and the email. The existing Airtable number field display precision is zero; change score displays to one decimal for readable 2.5-point increments before operational rollout and verify stored precision through the REST round trip.

Only two added fields: Results Email Status (text), Results Email Updated At (text). No status select options, legacy records, or prior client workflows are changed. Consent and readiness evidence are kept in Raw Payload JSON.

## Limits and release gates

- Live Airtable, verified sender, inbox delivery, and booking checks require configured provider settings. Mock tests do not certify them.
- Review the privacy notice and owner retention/contact practices before public release.
- Configure distributed spam protection before enabling public capture.
- Concurrent upserts depend on Airtable's provider semantics, and provider status writes can fail. Resend deduplicates within its retention window; the persisted sent status handles later retries when present.
- There are no payment links, paid blueprint fulfillment, CRM promotion, Telegram alerts, or autonomous MOB dispatch in this version.
- AMASOLAGI integration is planned only; see docs/amasolagi-integration-plan.md.

## Clarity & continuity update

The home page now offers the original Business Pressure Test and a separate six-question Founder Continuity Check. Continuity has no numeric resilience score. Its result can be downloaded as text or printed to PDF, and optional saving uses `/api/continuity`.

The optional USD $250 Client System Blueprint uses `/api/shop` and Stripe Checkout; payment sync uses `/api/stripe-webhook` with raw body signature verification. Checkout stays disabled until credentials, webhook, booking and email are configured. No live purchase was tested.

Coaching automation is prepared but paused pending Major's founder interview and approved email copy. It requires separate marketing consent. No scheduler is active. See `docs/deployment-readiness.md` for exact mappings, verification gates and remaining setup.
