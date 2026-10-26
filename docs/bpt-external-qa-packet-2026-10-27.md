# Business Pressure Test external-QA packet

Status: **prepared, not executed**
Scope: one protected-preview assessment save and requested transactional result email. This packet does not test checkout, Academy, Pillar Scroll, coaching nurture, production, or publishing.

QA pin: use only the exact PR #5 head SHA recorded under **External QA pin** in the reviewed pull-request description. The operator must record that SHA and the Vercel deployment ID before enabling capture; any mismatch stops the run.

## Controlled environment

- Vercel project: HAMAL AGI / `business-pressure-test`.
- Target: a protected Preview deployment of the reviewed PR commit, never Production.
- Flags: `ENABLE_SUBMISSIONS=true`; `ENABLE_CHECKOUT=false`; `ENABLE_NURTURE=false`.
- Airtable base: AMA MOB OS V2.
- Table roles: lead capture `tblYf3kEIWr0FxX2i`; Contacts / Client Profiles `tblWA2OJMcMrOtDkE`; Follow-up Queue `tbl1pPhCa6bx3ST3E`.
- The Follow-up Queue must not appear in `AIRTABLE_CONTACTS_TABLE_ID`, `AIRTABLE_TABLE_ID`, `AIRTABLE_ASSESSMENTS_TABLE_ID`, or `AIRTABLE_ORDERS_TABLE_ID`. Run `npm run launch:check` before enabling the Preview flag.
- Resend: verified `majoraimindset.com` transactional sender; provider key entered privately in Vercel Preview scope.

## Synthetic participant

- Name: `MAIM BPT QA 2026-10-27`
- Recipient: a new plus-address or alias in one founder-approved, privately controlled adult QA inbox, supplied to the operator as `BPT_QA_RECIPIENT`. It must not already exist in Client Profiles. The private address is intentionally excluded from public Git.
- Phone/Telegram: blank.
- Business type: `Freelancing / Consulting`.
- Revenue range: `Pre-revenue`.
- Readiness: `Exploring my options`.
- Biggest issue: `Synthetic QA only — verify one saved diagnostic and requested result email.`
- Answers: use the first listed option for Q1–Q10.
- Save consent: checked. Optional coaching consent: **unchecked**.

Do not proceed until the exact controlled recipient has been privately resolved. Do not substitute a customer, client, mailing list, disposable public inbox, or invented address.

## Expected records and events

1. Browser loads `/api/challenge`; capability says capture available and returns a short-lived challenge.
2. Initial POST to `/api/submit` returns `saved:true`, a `maim_…` submission reference, `contactStatus:synced`, `followupStatus:not_requested`, and `emailStatus:sent` (provider acceptance only).
3. Airtable lead capture contains exactly **one** row for the returned Submission ID, all ten answers, server-derived scores/signals, consent evidence, and a Contact Record ID.
4. Client Profiles contains exactly **one new** normalized-email QA contact linked from that assessment. If a matching contact exists before the run, stop and choose a fresh controlled alias.
5. MAIM Follow-up Queue creates **zero** rows because coaching consent is unchecked.
6. Resend records exactly **one** accepted result email with the Submission ID as idempotency key; the controlled inbox receives exactly **one** message and its links are reviewed without booking.
7. Repeating the identical POST once through the retry control produces a second successful API receipt while retaining exactly **one** assessment, **one** contact, **one** accepted Resend message and **one** inbox message.
8. No Stripe Session, order, payment, booking, Academy enrollment, Pillar Scroll entitlement, external message beyond the requested QA result, or production record is created.

## Evidence to retain

- Reviewed Git commit and protected Preview deployment ID.
- Two redacted API response receipts: initial save and one identical retry.
- One assessment record ID and one Client Profiles contact record ID, plus a field-level PASS/BLOCKED checklist; no answers or recipient address in Git.
- One Resend message ID plus one separate inbox-receipt timestamp. Provider acceptance and inbox receipt are reported separately.
- Before/after count receipt: assessments `0 → 1 → 1`; QA contacts `0 → 1 → 1`; Follow-up Queue `0 → 0 → 0`; MAIM Orders `0 → 0 → 0`; Stripe events `0`; bookings `0`.
- One configuration receipt showing capture enabled only for the bounded window, checkout/nurture false, and the table-role check passing. Values and secrets stay private.
- `npm run launch:check` output containing setting names/status only.

## Cleanup

After evidence review, disable `ENABLE_SUBMISSIONS` in Preview and redeploy the same reviewed commit. Retain the redacted evidence. With owner-approved cleanup, delete exactly **two Airtable records**: the one assessment record and the one newly created QA contact, both by captured record ID. Delete **zero** Follow-up Queue rows and **zero** order rows. Retain the one Resend provider receipt and inbox evidence; do not attempt to erase provider audit logs. Confirm post-cleanup counts return to zero for the exact QA Submission ID and recipient. Never use a broad name/email deletion or touch a pre-existing contact.

## Stop conditions

Stop without submission if the recipient is unresolved, the Preview is not protected, launch check reports any table-role conflict, the sender is unverified, the configured Contacts table differs from Client Profiles, or any flag would enable checkout/nurture/Production. After submission, stop on the first unexpected write, duplicate, customer-visible claim, or cross-journey event.
