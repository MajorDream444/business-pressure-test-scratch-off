> Reconciliation: this PR's broader acceptance packet is distinct from the
> limited BPT-save/reservation-provenance packet in Major-AI-OS
> `docs/qa/MAIM_FUNNEL_TEST_PACKET_2026-10-27.md`. Neither is executed or approved.
> Follow immutable candidate pins and keep simulation separate from inbox receipt.

# Business Pressure Test protected-Preview acceptance packet

Status: **prepared, not executed**

Immutable application candidate: `7142207645a78b47215f1bc2e3a736c96f042e65`

That SHA is the only application source eligible for this acceptance run. The later packet-only commit may document the procedure but must not replace the application SHA. Record the SHA and protected-Preview deployment ID before any provider setting is enabled; a mismatch is a stop condition.

Superseded candidate pins `2891852f80b1015852e6940b07c0ebba6a184e7e` and `239af00245916dbaac086b8f5f529067ead2ea4f` remain in history as evidence. They are retired from future acceptance because later concurrent merges changed `api/submit.ts` and `src/App.tsx`; current `main` at `977959dd61523eee077b1353a272dd5f0fb7fc0f` did not compile. The immutable candidate restores the reviewed runtime on current main and passes 33 tests.

Deployment reconciliation at preparation time:

- Immutable-candidate protected Preview `dpl_EC4kxnth1htcBsU97Rhxp5B9sBUB` (`https://business-pressure-test-b9xfd5c9t-hamal-agi.vercel.app`) is Ready and direct Vercel metadata maps it exactly to `7142207645a78b47215f1bc2e3a736c96f042e65`. An unauthenticated request is redirected to Vercel Authentication; protection is present. This identifies the eligible environment but does not authorize or execute QA.
- `239af00245916dbaac086b8f5f529067ead2ea4f` intentionally skipped Vercel and has no exact protected deployment.
- Protected Preview `dpl_AAZVudXgCmuDav5vxiBVGeJgSwir` (`https://business-pressure-test-ntgl0a5fr-hamal-agi.vercel.app`) is Ready but maps to superseded packet SHA `c8b19cc2c18cc2a5f6cdb5f88e16e048c6d71e6c`, not the immutable candidate.
- Production `dpl_3At3yzY1aoAwicmWg6F37y6zV3pP` maps to merge SHA `e6c8bc25e0e4d4f9c11c2f77adcf93a02ab6e62d`. Merge/deployment is not provider acceptance or customer readiness.
- Do not run acceptance unless the exact protected Preview above remains Ready, protected, and mapped to the immutable candidate at the separately authorized execution time.

## Scope boundary

This packet covers BPT save provenance only: one consented BPT result, its stable Submission ID, one disposable contact link, and an optional provider-test email acceptance receipt. It does **not** cover actual inbox delivery, continuity, nurture, Academy sign-in, Academy paid-seat concurrency, Pillar Scroll, Stripe checkout, payment, refund, dispute, entitlement, revocation, booking, production, publishing, or customer messaging.

## Origins

- Local verification origin: `http://127.0.0.1:3000`, using fixtures/mocks only and no provider credentials.
- Acceptance origin: the private HTTPS URL of the protected Preview for the immutable SHA. Store it privately in `APP_ORIGIN`; do not put the URL in Git.
- Production origins are forbidden. A redirect, alias, or environment resolving to Production stops the run.

## Disposable Preview mapping

Use a new QA-only Airtable base and QA-only tables, created and removed under owner approval. Record private resource IDs in the operator evidence, never in Git. The exact role mapping is expressed only by environment-variable name:

| Environment variable | Disposable role | Maximum effect |
| --- | --- | --- |
| `AIRTABLE_BASE_ID` | QA-only base | contains only this run's fixtures |
| `AIRTABLE_TABLE_ID` | QA-only BPT result table | one record |
| `AIRTABLE_CONTACTS_TABLE_ID` | QA-only contact table | one contact |
| `AIRTABLE_PAT` | least-privilege token for the two QA tables | read/write only those tables |
| `RESEND_API_KEY` | Preview-scoped sending credential | one provider-test acceptance |
| `RESEND_FROM_EMAIL` | verified transactional sender | no mailbox access |
| `RESEND_REPLY_TO` | private controlled reply route | no test replies |
| `APP_ORIGIN` | exact protected-Preview origin | one origin only |

Set `ENABLE_SUBMISSIONS=true`, `ENABLE_CHECKOUT=false`, and `ENABLE_NURTURE=false` only in the protected Preview. Leave `AIRTABLE_ASSESSMENTS_TABLE_ID`, `AIRTABLE_ORDERS_TABLE_ID`, `AIRTABLE_FOLLOWUP_TABLE_ID`, Stripe variables, Supabase variables, and scheduling variables unset. No segment, membership, order, entitlement, or production table is mapped.

Proof that existing production integrations remain untouched requires all of the following before the run: Preview-only environment scope; QA-only Airtable token/base/tables; no production resource identifier in the operator's private mapping; checkout and nurture false; forbidden variables unset; and baseline/final production counts or audit timestamps unchanged. This repository change itself made no provider call. If isolation cannot be proved, do not run the packet.

## Fixtures and limits

Use a unique private `RUN_ID` and derive every fixture label from it. Store the exact values privately.

- Participant: synthetic adult QA identity, never a customer or existing contact.
- Save consent: true.
- Optional coaching/marketing consent: false.
- Answers: fixed Q1–Q10 fixture documented in the private run sheet.
- Honeypot: empty.
- Submission attempts: exactly two—initial and one identical idempotency retry.
- BPT records: maximum one.
- Contacts: maximum one.
- Follow-up memberships/segments: exactly zero.
- Result-email provider acceptances: maximum one.
- Actual inbox messages: zero in this packet.
- Orders, Stripe objects/events, bookings, enrollments, entitlements, continuity records, Academy records, and Pillar Scroll records: exactly zero.

For the email branch, use a Resend provider test address privately supplied for this run. A Resend test-address response is **simulated/provider testing only**; it is not evidence of inbox delivery, recipient ownership, deliverability, or customer messaging. Actual inbox-delivery evidence requires a separately and privately approved adult-controlled inbox and a separate authorization; it remains unexecuted.

## Consent and suppression cases

1. Local fixture: `consent=false` must return validation failure and produce zero fetch/provider calls.
2. Local fixture: missing or cross-origin `Origin` must fail before any provider call.
3. Protected Preview: `consent=true` and marketing consent false may create the bounded save/contact/email-test effects above.
4. Suppression: marketing consent false plus `ENABLE_NURTURE=false` and no `AIRTABLE_FOLLOWUP_TABLE_ID` must yield `followupStatus:not_requested` and zero membership/segment writes.
5. The retry must retain the same Submission ID, one BPT record, one contact, and at most one provider acceptance.

Purchase, unsubscribe, prior-customer, refund, dispute, and revocation suppression are outside this BPT save-provenance packet and remain release-gated.

## Procedure and evidence

1. Confirm the Preview is protected and built from the immutable SHA; retain the deployment ID and source receipt.
2. Confirm the private environment receipt contains only the allowed variable names above, with flags and forbidden-variable absence. Do not retain values in Git.
3. Record zero baseline counts for the private `RUN_ID` in both disposable tables and zero relevant production audit/count changes.
4. Load `/api/challenge`; retain the redacted capability receipt.
5. Submit once; retain a redacted response containing `saved:true`, the Submission ID, `contactStatus:synced`, `followupStatus:not_requested`, and the provider-test `emailStatus`.
6. Retry the identical payload once; retain the second redacted response and verify the same Submission ID.
7. Retain exact private fixture IDs: one BPT Airtable record ID, one contact record ID, and, if accepted, one Resend provider receipt ID. Do not retain the address, answers, tokens, URLs, or resource IDs in Git.
8. Verify final counts: BPT `0 → 1 → 1`; contact `0 → 1 → 1`; memberships/segments `0`; provider acceptances `0 → at most 1 → at most 1`; every excluded resource `0`.
9. Disable submissions in Preview before cleanup.

## Fixture-ID cleanup

Using only the two captured Airtable record IDs, delete exactly one BPT record and one contact record from the disposable QA tables. Never delete by broad name/email query. Delete zero memberships, orders, or production records. Confirm both `RUN_ID` counts return to zero, then revoke the QA-only Airtable token and remove the disposable QA base/tables according to owner policy. Retain redacted provider/audit receipts; do not attempt to erase provider audit logs.

## Stop conditions

Stop before submission if the SHA or deployment ID differs; Preview protection is absent; the private recipient/test identity is unresolved; any resource is not disposable; the token can access production; a production ID appears in the mapping; any forbidden variable is set; checkout/nurture is enabled; the origin is not the exact protected Preview; launch/table-role checks fail; or baseline counts are nonzero.

After submission, stop immediately on a second BPT record/contact/provider acceptance; any membership, segment, order, Stripe, booking, Academy, entitlement, continuity, Pillar Scroll, production or customer event; any unapproved external message; an unstable Submission ID; or inability to clean up by the exact fixture IDs.

## Suite provenance

- `6cacfd1d0ad60859ef93956444a04ebbd492553c`: `npm test` reported 25/25. This was the complete earlier rewrite before reconciliation guards.
- `998f44177e5ae5d26f9856223bca264c497cd7cd`: `npm test` reported 29/29. Four tests were added for Airtable role policy and unsafe contact mapping.
- `2891852f80b1015852e6940b07c0ebba6a184e7e`: `npm run check` reported 31/31. Two tests were added for dependency floors and missing-Origin rejection. The same command also runs TypeScript and the Vite production build.
- `239af00245916dbaac086b8f5f529067ead2ea4f`: `npm run check` reported 33/33 after adding independent results-email gating and delivery-status persistence evidence.
- `7142207645a78b47215f1bc2e3a736c96f042e65`: `npm run check` reports 33/33 on current main after restoring the reviewed BPT runtime overwritten by concurrent PR #4. This is the immutable application candidate.

Exact full-suite commands for the immutable candidate:

```sh
npm ci
npm run lint
npm test
npm run build
npm run check
npm audit --json
npm ls body-parser qs esbuild express vite --all
git diff --check
```

Focused subsets used during development are filters over the same test files and are not substitutes for 31/31:

```sh
node --import tsx --test tests/table-policy.test.ts
node --import tsx --test tests/submit.test.ts
node --import tsx --test tests/dependency-policy.test.ts
```
