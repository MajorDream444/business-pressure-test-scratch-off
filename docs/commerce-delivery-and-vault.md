# MAIM purchase, delivery and vault contract
October 14, 2026. Working specification and agreement drafts; not a live portal or approved legal instrument.

## Product catalogue
| SKU | Price | Included | State |
|---|---|---|---|
| MAIM-BLUEPRINT-001 | USD250 one-time | One 30–45 minute personal review; one-page map; three priorities; first client-flow blueprint | Existing Stripe product/price; checkout disabled |
| STB-BPA-PILOT-001 | Proposed USD625 | Practitioner Booking Path Audit and debrief | Separate pilot; do not activate here |
| MAIM-COACHING-001 | Unpriced | Additional one-to-one conversations with agreed count/duration | Draft only; no Stripe price created |
| MAIM-SPRINT-001 | Individually scoped | Implementation, checkpoints, weekly reports while active | Draft only |
| MAIM-VAULT-SETUP-001 | Unpriced | Inventory, organization, transcription and approved access packaging | Draft only |
| MAIM-VAULT-MEMBERSHIP-001 | Unpriced | Client-owned archive membership | Future separate recurring offer; not enabled |

Existing Blueprint product: prod_VQ3PnQKlO2DtQu. Existing live price: price_1UPDJ5BaiziDnHMmtX8KZObp. Sandbox requires its own price, never reuse the live ID with a test key. Descriptor, support identity, contracting entity, tax treatment and statement descriptor remain owner-confirmation items. Do not create unknown tax codes or prices. Product metadata: brand=MAIM, sku=MAIM-BLUEPRINT-001, fulfillment=human_review. Checkout metadata now includes scope_version and agreement_version. No client narratives in Stripe metadata.

## Variables and operation
STRIPE_SECRET_KEY: server-only sensitive variable; preferably restricted key with minimum Checkout creation and product/price/session read permissions, validated in sandbox.
STRIPE_MODE: test or live. STRIPE_BLUEPRINT_PRICE_ID: matching-mode fixed price. STRIPE_WEBHOOK_SECRET: server-only signature secret. ENABLE_CHECKOUT: false until verified. APP_ORIGIN: canonical HTTPS origin. SHOP_BOOKING_URL: tested scheduling link. SHOP_SUPPORT_EMAIL: monitored business support. RESEND_API_KEY and RESEND_FROM_EMAIL: server credential and verified sender. Airtable PAT/base/contact/order table variables: existing server-owned sync.

CHECKOUT_TERMS_APPROVED=false by default. SHOP_TERMS_URL must be HTTPS; SHOP_AGREEMENT_VERSION identifies immutable reviewed terms. Set the same public terms URL in Stripe public business settings before testing required terms consent. The local code requires terms acceptance in hosted Checkout. This is not a substitute for a separately signed implementation statement of work.

Signed paid session → idempotent order record → contact match → confirmation and personal-session scheduling. Existing webhook runs this path; provider credentials and end-to-end tests remain missing. No workspace access is granted merely from a return-page parameter. Refund/dispute reconciliation remains manual until a dedicated tested handler exists.

## Reuse classification and current implementation
Platform-wide: MAIM identity, role boundaries, tenant isolation, provenance, consent and retention.
Reusable modules: purchased scope, delivery status, evidence-based weekly reports, vault rights gate.
Client-only: client brand, approved assets, offer, milestones, chosen communication and meeting schedule.

shared/delivery.ts implements pure scope constants, weekly report generation, publication eligibility, and commercial vault eligibility. These are scaffolding predicates, not authentication, storage permissions or a running portal. Runtime must bind actor identity and workspace membership from authenticated server state; never accept role/workspaceId/approvedBy supplied by a browser as authorization.

The CIW repository currently has Stage A architecture only. Do not describe it as a deployed portal. Target integration should follow its lifecycle and configuration contract. This specification does not migrate or expose any client.

## Workspace configuration and screens
Template clientId/workspaceId: provision from paid order by trusted server, never customer input. Client name/branding: intake-approved. Modules: dashboard, journey, deliverables, meetings, payments, reports; vault only if separately purchased. Default next action: schedule the included review. Initial progress: zero completed milestones, not an invented percentage. Owner: assigned operator.

Screens: Overview (one next action, scope, status); My Purchase (paid receipt, included/excluded scope, agreement version); Session (booking link, prep, reschedule policy); Journey (milestones and blockers); Deliverables (approved sources and review); Weekly Update (done/why/next/waiting); Vault (authorized private collections and access entitlement). Platform rail uses official MAIM mark and system-contract tokens; client content uses client theme. Never recreate the MAIM mark.

Design specification: calm MAIM black/gold/ivory frame, one primary action, explicit empty states. Explain progress in 30 seconds. Do not label client delays as lack of character or claim ROI without measurement. No fabricated dashboard fixtures that appear real.

## Sources and synchronization
Stripe owns payment facts; webhook owns order sync; Airtable owns operations and contact IDs. Notion owns approved operating narrative. Drive/object storage owns private media. GitHub owns code and versioned schemas. CIW displays reviewed synthesis. Source conflicts require operator review; no last-write-wins over client-owned notes. Model-provider ingestion requires separate authorized processing scope.

## Delivery loop and harness
1. Validate paid canonical session and scope version; upsert order by session ID.
2. Operator reviews identity, signed scope and required inputs; invite authenticated client. Provision idempotently by order ID. No live provisioner exists yet.
3. Schedule included review; record attendance and approved action map. No recording by default.
4. For active multi-week engagements, collect dated milestone evidence and dependency updates weekly. Generate a draft with weeklyReport. Empty weeks must say no deliverables recorded.
5. Operator approves exact report revision; publication requires tenant membership and role verification. Marketing opt-in is unrelated to transactional delivery updates.
6. Publish to authenticated workspace; send only after explicit authorization or approved contractual workflow. This change sends no messages and installs no scheduler.
7. Review delivered items: built → activated → in use at 30 days. Completed means verified evidence, not task generation.
8. Handoff/export, revoke access as agreed, reconcile payments, apply retention.

Harness: durable outbox with unique order/event/report-version keys; retries with backoff; dead-letter review; no success acknowledgment before durable receipt; provider errors recoverable. Log correlation/order references, event type, attempt and outcome; never content, email addresses, source transcripts or keys. Alerts go to assigned operator only after an authorized notification channel is established. These adapter/scheduler paths remain to be implemented and tested.

## Participant agreement — review draft
Parties: verified contracting entity [confirm] and participant [confirmed identity]. Order/SKU, currency, price, scope version, effective date and terms version recorded. No automatic enrollment in recurring payments.

Blueprint scope: one personal 30–45 minute conversation and the stated map/priorities/blueprint. Deliverable due date agreed at scheduling. Not a full system build, unlimited messaging, ongoing coaching or vault. No guaranteed revenue, transformation or clinical service. Participants may decline personal reflection without losing core service.

Participant responsibilities: provide requested business materials by agreed dates, own or have permission to use supplied content, attend/reschedule the session under the published policy, consolidate feedback and approve access intentionally. Provider responsibilities: stated deliverables, agreed communication cadence, confidential handling, visible progress and prompt notice of blockers.

Missed commitments: first send a factual reminder and invite clarification. If a required input remains missing, pause the affected task and propose a revised schedule; both parties see the reason. Resume and any changed scope require written agreement. The pause, reminder window, rescheduling notice and maximum inactivity period are fields to agree, not hidden defaults.

Financial consequences: no automatic fines, forfeiture or surprise charges. Any cancellation/no-show/restart fee must be specifically disclosed and agreed before payment, with amount, trigger and applicable exceptions. Refunds, statutory rights, governing law, liability, dispute route and signature formalities require jurisdiction-appropriate professional review. This draft does not declare such terms enforceable.

Symmetry: provider delays trigger notice and a revised plan, with remedies consistent with reviewed terms. New work uses a change order describing price, timeline, approvals and dependencies. Ending engagement includes delivery of earned outputs and permitted export; data is not held hostage to disputed penalties.

Separate documents before activation: reviewed purchase terms; implementation SOW; participant commitments/change-order template; privacy/processing agreement; recording and third-party content consent; vault commercial licensing schedule. Checkout consent proves assent to purchase terms, not completion of every separate signature.

## Knowledge Vault product
Purpose: turn authorized unstructured workshops, videos, calls and documents into a searchable private archive, then selected paid resources if licensed. Private storage alone does not grant resale rights.

Pipeline: inventory → ownership/consent review → upload malware/type/size validation → checksum/deduplicate → transcript → speaker/time/source mapping → human review → collections/search → authorized export → separately approved productization.

Each asset: tenant ID, source owner, file/checksum, title/date/language, consent/rights, visibility, processor authorization, retention, version, derived transcript references and review status. No client names or authentic private media in repository fixtures. Unknown rights default private, excluded from sale/model ingestion.

Access: tenant-scoped private buckets and authorization on every download, short-lived URLs, no publicly predictable paths. Commercial entitlement checked server-side from verified payments and approved licence; refund/dispute changes need reconciliation. Agents search only assets available to the authenticated actor. Participants in recorded calls must have suitable consent for the proposed use. Clients own their content; platform rights are limited to agreed service delivery.

Privacy proposal pending owner review: raw intake/media deletion 30 days after completed handoff unless separately retained by agreement; approved vault media while engagement/subscription active plus agreed export window; legal/payment retention separately determined with jurisdictional advice. Withdrawal/deletion must cover originals, derivatives, search indices and processors. Do not activate ingestion until policy and controls are implemented.

Pricing discovery: count source hours/files/languages, quality, rights complexity, storage, transcription cost, support and retrieval needs. Quote setup separately from ongoing hosting. Do not promise unlimited storage or automatic passive income. First pilot: synthetic/public licensed content, no named-client ingestion.

## Readiness evidence
Tests: synthetic weekly update and vault negative authorization/rights tests; checkout policy gate tests. Observability: deliveryEvent emits only workspace reference/event/time; runtime durable logs and health alerts not installed. PII: pure local functions process supplied records without network, logs or persistence. New runtime adapters require authenticated tenant enforcement, encryption, retention/deletion, signed URL and provider-error tests. No production readiness claimed.

Owner actions: confirm contracting entity, review/cancellation terms, booking/delivery capacity, application credentials and intended CIW MVP. Implementation actions: tenant-authenticated provisioner/portal, durable reports outbox, vault storage and ingestion; sandbox order→workspace→report tests. Production remains blocked; no client migrations, contracts sent, or notifications scheduled.
