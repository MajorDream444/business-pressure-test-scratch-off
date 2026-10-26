# Business Pressure Test external-QA packet

Status: **prepared, not executed**
Scope: one protected-preview assessment save and requested transactional result email. This packet does not test checkout, Academy, Pillar Scroll, coaching nurture, production, or publishing.

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
- Recipient: one founder-approved, privately controlled adult QA inbox, supplied to the operator as `BPT_QA_RECIPIENT`. The private address is intentionally excluded from public Git.
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
2. One POST to `/api/submit` returns `saved:true`, a `maim_…` submission reference, `contactStatus:synced`, `followupStatus:not_requested`, and `emailStatus:sent` (provider acceptance only).
3. Airtable lead capture contains exactly one row for the returned Submission ID, all ten answers, server-derived scores/signals, consent evidence, and a Contact Record ID.
4. Client Profiles contains either one new normalized-email QA contact or reuses the one exact existing QA contact; operator-owned fields are not overwritten.
5. MAIM Follow-up Queue creates **zero** rows because coaching consent is unchecked.
6. Resend records one accepted result email with the Submission ID as idempotency key; the controlled inbox receives the message and its links are reviewed without booking.
7. Repeating the identical POST through the retry control keeps one assessment row, one contact, and no second accepted email.
8. No Stripe Session, order, payment, booking, Academy enrollment, Pillar Scroll entitlement, external message beyond the requested QA result, or production record is created.

## Evidence to retain

- Reviewed Git commit and protected Preview deployment ID.
- Redacted timestamps and returned Submission ID.
- Airtable record IDs and field-level PASS/BLOCKED checklist, without answers or recipient address in Git.
- Resend message ID plus separate inbox-receipt timestamp. Provider acceptance and inbox receipt are reported separately.
- Retry result proving unchanged record counts.
- `npm run launch:check` output containing setting names/status only.

## Cleanup

After evidence review, disable `ENABLE_SUBMISSIONS` in Preview and redeploy the same reviewed commit. Retain the redacted evidence. Delete only the exact synthetic assessment/contact records if the owner approves cleanup and the contact was created solely for this packet; identify them by returned record IDs and normalized QA recipient, never a broad name/email search. Confirm zero Follow-up Queue rows before and after. Do not delete provider delivery logs needed for audit or any pre-existing contact.

## Stop conditions

Stop without submission if the recipient is unresolved, the Preview is not protected, launch check reports any table-role conflict, the sender is unverified, the configured Contacts table differs from Client Profiles, or any flag would enable checkout/nurture/Production. After submission, stop on the first unexpected write, duplicate, customer-visible claim, or cross-journey event.
