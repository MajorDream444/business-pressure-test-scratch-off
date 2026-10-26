# Complete candidate review — 27 October 2026

Scope: the full `maim/deployment-ready` candidate in draft PR #5, including the earlier assessment, continuity, capture, checkout, webhook, nurture, policy and Supabase preparation—not only the later Airtable mapping guard.

## Findings and disposition

| Area | Direct evidence | Disposition |
| --- | --- | --- |
| High dependency advisory | `npm audit` identified `body-parser <1.20.9` through Express. `server.ts` invokes `express.raw` and `express.json`, so malicious compressed requests could reach the parser when the local development server was exposed. `vercel.json` deploys Vite static output plus individual `api/*.ts` functions; those handlers do not import Express/body-parser. | Patched lock to `body-parser 1.20.9`. Local development now binds to `127.0.0.1`, not all interfaces. Regression test enforces the reviewed floor. High finding resolved. |
| Moderate `qs` advisories | Express depended on `qs 6.14.2`; query parsing is part of the Express development runtime. | Package override pins `qs 6.16.1`; moderate findings resolved. Regression test enforces `>=6.16.0`. |
| Remaining low advisory | `npm audit` reports `esbuild 0.27.7` through the direct development tool `tsx`. Repository code does not import `esbuild`, call its `serve` API, or ship it in Vite output. Vite's own transform dependency is the separate `esbuild 0.25.12`, outside the reported range. Production is static output plus serverless functions. | Build-tool-only and not reachable through the deployed application. Do not expose developer tooling to untrusted networks. Reassess when `tsx` supports a fixed compatible esbuild; this low finding is recorded, not represented as zero-risk. |
| Airtable role confusion | Authoritative mapping: Client Profiles / Contacts `tblWA2OJMcMrOtDkE`; MAIM Follow-up Queue `tbl1pPhCa6bx3ST3E`. | Runtime and launch checks fail closed before provider writes when Follow-up Queue is configured as Contacts, lead capture, assessments or orders. Continuity, webhook and unsubscribe paths now use the same policy. |
| Cross-origin capture | Earlier capture handlers accepted requests with no Origin header. The challenge reduces automation but is obtainable from the public capability endpoint. | BPT and continuity saves now require a same-host Origin before any provider request. Existing challenge, honeypot, validation, size and instance-rate guards remain. Public release still requires shared rate limiting. |
| Results and email truthfulness | API awaits Airtable persistence and Resend provider acceptance; UI distinguishes saved, email failed and email unavailable. Provider acceptance is not delivery. Stable submission/email idempotency references are covered by tests. | Source behavior passes. Real Airtable round trip, Resend acceptance, inbox receipt, retry and cleanup remain external-QA gates. |
| Commerce separation | Checkout validates fixed SKU/amount/currency/mode and terms gate; webhook verifies raw Stripe signature and canonical Session. Flags default off. Academy and Pillar Scroll are not routed through this implementation. | No activation. Refund/dispute handling remains manual and must be documented/verified before a public paid release. BPT external QA excludes checkout. |
| Nurture separation | Founder-approved coaching copy array is empty and readiness remains false. Follow-up table is separate and consent-gated. | No nurture execution. External BPT QA uses marketing consent false and expects zero Follow-up Queue rows. |

## Release gates

Before public BPT capture: run the pinned protected-Preview packet, prove exact record counts and inbox receipt, retain redacted receipts, restore the capture flag to false, and configure shared rate limiting. Before any paid Blueprint release: separately approve policies and perform a Stripe TEST checkout/webhook/order/email/refund-reconciliation exercise. Passing local tests or Vercel build checks is not either external proof.
