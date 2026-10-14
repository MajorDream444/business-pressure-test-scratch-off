import type { ApiRequest, ApiResponse } from "./submit.js";
import { issueChallenge } from "../shared/server-protection.js";
export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  const enabled = process.env.ENABLE_SUBMISSIONS === "true";
  const secret = process.env.AIRTABLE_PAT;
  const capture =
    enabled &&
    !!secret &&
    !!process.env.AIRTABLE_BASE_ID &&
    !!process.env.AIRTABLE_TABLE_ID;
  const email =
    !!process.env.RESEND_API_KEY &&
    !!process.env.RESEND_FROM_EMAIL &&
    !process.env.RESEND_FROM_EMAIL.includes("resend.dev");
  return res
    .status(200)
    .json({
      captureAvailable: capture,
      continuityAvailable: capture && !!process.env.AIRTABLE_ASSESSMENTS_TABLE_ID && !!process.env.AIRTABLE_CONTACTS_TABLE_ID,
      emailAvailable: email,
      challenge: capture ? issueChallenge(secret!) : null,
    });
}
