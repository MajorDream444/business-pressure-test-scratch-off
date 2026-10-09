# Business Pressure Test

Mobile-first lead-gen quiz: collects contact + business context, runs a 10-question diagnostic, shows a 0–100 score, saves the lead to Airtable and emails the results.

- **Frontend:** React 19 + Vite (`src/`). Scoring logic lives in `src/scoring.ts` and is shared with the server.
- **Backend:** Vercel function `api/submit.ts` (the same handler runs locally through `server.ts`). It validates input, **recomputes the score from the raw answers** (client-sent scores are ignored), dedupes on `Submission ID`, writes to Airtable, then sends the results email via Resend.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values (or use env/.env.local)
npm run dev                  # http://localhost:3000
```

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables). Never put secrets in `VITE_` variables, and never commit them.

| Variable | Where | Purpose |
|---|---|---|
| `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID` | server | Target table |
| `AIRTABLE_PAT` | server | Token with **read + write records** on the base (read is needed for duplicate detection) |
| `RESEND_API_KEY` | server | Sends the results email |
| `RESEND_FROM_EMAIL` | server | Sender on a **verified Resend domain** (`onboarding@resend.dev` only delivers to your own account) |
| `APP_SOURCE` | server | Optional, defaults to `business-pressure-test` |
| `VITE_CALENDLY_URL`, `VITE_GUMROAD_URL` | build time | CTA links. Redeploy after changing — Vite embeds them at build |

## Airtable setup and checks

```bash
npm run setup:airtable   # creates missing fields; reports fields that still need manual fixes
npm run test:airtable    # writes one row directly to Airtable
npm run test:endpoint    # full check of the endpoint: save, dedupe, validation, email
```

Airtable's API cannot change number precision: set **Score Q1–Q10** to 1 decimal place in the Airtable UI (answers score 0 / 2.5 / 5 / 7.5 / 10).

For a protected Vercel deployment: `TEST_URL=https://<deployment>/api/submit VERCEL_AUTOMATION_BYPASS_SECRET=<secret> npm run test:endpoint`.

## Checks before release

```bash
npm ci && npm run lint && npm run build
```
