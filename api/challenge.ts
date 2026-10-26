import type { ApiRequest, ApiResponse } from "./submit.js";
import { issueChallenge } from "../shared/server-protection.js";
import { assessmentsTableReady, contactsTableReady, leadCaptureTableReady } from "../shared/table-policy.js";
import { captureReady } from "../shared/integrations.js";
export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  const secret = process.env.AIRTABLE_PAT;
  const capture = captureReady() && leadCaptureTableReady();
  const email =
    process.env.ENABLE_RESULTS_EMAIL==='true' &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.RESEND_FROM_EMAIL &&
    !process.env.RESEND_FROM_EMAIL.includes("resend.dev");
  return res
    .status(200)
    .json({
      captureAvailable: capture,
      continuityAvailable: capture && assessmentsTableReady() && contactsTableReady(),
      emailAvailable: email,
      challenge: capture ? issueChallenge(secret!) : null,
    });
}
