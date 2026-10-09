import { createHash } from "node:crypto";
import { validateSubmission, diagnose, toFields } from "../shared/diagnostic.js";
import { buildEmail, safeUrl } from "../shared/email-template.js";
import { validChallenge } from "../shared/server-protection.js";
export interface ApiRequest {
  method?: string;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}
export interface ApiResponse {
  status(code: number): ApiResponse;
  json(value: unknown): unknown;
  setHeader(name: string, value: string): unknown;
}
const requests = new Map<string, { count: number; until: number }>();
export function allowRequest(key: string, now = Date.now()) {
  if (requests.size > 10000)
    for (const [k, v] of requests) if (v.until < now) requests.delete(k);
  const prior = requests.get(key);
  if (!prior || prior.until < now) {
    requests.set(key, { count: 1, until: now + 60000 });
    return true;
  }
  prior.count++;
  return prior.count <= 6;
}
export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (process.env.ENABLE_SUBMISSIONS !== "true")
    return res
      .status(503)
      .json({
        error:
          "Saving is not available yet. Your results are still on this screen.",
      });
  const {
    AIRTABLE_PAT: pat,
    AIRTABLE_BASE_ID: base,
    AIRTABLE_TABLE_ID: table,
  } = process.env;
  if (!pat || !base || !table)
    return res
      .status(503)
      .json({
        error: "Saving is temporarily unavailable. Please try again later.",
      });
  const origin = String(req.headers.origin ?? ""),
    host = String(req.headers.host ?? "");
  try {
    if (origin && new URL(origin).host !== host)
      return res
        .status(403)
        .json({ error: "Please submit from the pressure test." });
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
  const ip = String(req.headers["x-forwarded-for"] ?? "unknown").split(",")[0];
  if (!allowRequest(createHash("sha256").update(ip).digest("hex"))) {
    res.setHeader("Retry-After", "60");
    return res
      .status(429)
      .json({ error: "Please wait a minute before trying again." });
  }
  let input;
  try {
    if ((JSON.stringify(req.body) ?? "").length > 16000)
      return res.status(413).json({ error: "Submission is too large." });
    input = validateSubmission(
      typeof req.body === "string" ? JSON.parse(req.body) : req.body,
    );
    if (input.website || !validChallenge(input.challenge, pat))
      return res
        .status(400)
        .json({ error: "Please refresh the save form and try again." });
  } catch {
    return res
      .status(400)
      .json({ error: "Please check your answers and contact details." });
  }
  const submissionId =
    "maim_" +
    createHash("sha256")
      .update(
        JSON.stringify({
          id: input.submissionId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          telegramOrPhone: input.telegramOrPhone,
          businessType: input.businessType,
          revenueRange: input.revenueRange,
          biggestIssue: input.biggestIssue,
          readiness: input.readiness,
          answers: input.answers,
        }),
      )
      .digest("hex");
  const fields = toFields(input);
  fields["Submission ID"] = submissionId;
  const endpoint = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;
  const headers = {
    Authorization: `Bearer ${pat}`,
    "Content-Type": "application/json",
  };
  let record: { id: string; fields: Record<string, unknown> };
  try {
    const saved = await fetch(endpoint, {
      method: "PATCH",
      headers,
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["Submission ID"] },
        records: [{ fields }],
      }),
    });
    if (!saved.ok) {
      console.error("[capture] provider rejected save", saved.status);
      return res
        .status(502)
        .json({ error: "We could not save your results. Please try again." });
    }
    const data = await saved.json();
    record = data.records?.[0];
    if (!record?.id) throw new Error("Missing saved reference");
  } catch {
    console.error("[capture] save unavailable");
    return res
      .status(502)
      .json({
        error:
          "We could not confirm the save. Retrying uses the same reference.",
      });
  }
  if (record.fields["Results Email Status"] === "sent")
    return res
      .status(200)
      .json({ success: true, saved: true, emailStatus: "sent", submissionId });
  const key = process.env.RESEND_API_KEY,
    from = process.env.RESEND_FROM_EMAIL;
  let emailStatus = "not_configured";
  if (key && from && !from.includes("resend.dev")) {
    try {
      const email = buildEmail(input, safeUrl(process.env.VITE_CALENDLY_URL));
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": submissionId,
        },
        body: JSON.stringify({ from, to: [input.email], ...email }),
      });
      if (!sent.ok) throw new Error("Provider rejected email");
      const receipt = await sent.json();
      if (!receipt.id) throw new Error("Missing email receipt");
      emailStatus = "sent";
    } catch {
      emailStatus = "failed";
      console.error("[email] results send failed");
    }
  }
  try {
    const update = await fetch(endpoint, {
      method: "PATCH",
      headers,
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        records: [
          {
            id: record.id,
            fields: {
              "Results Email Status": emailStatus,
              "Results Email Updated At": new Date().toISOString(),
              ...(!record.fields["Submitted At"]
                ? { "Submitted At": new Date().toISOString() }
                : {}),
            },
          },
        ],
      }),
    });
    if (!update.ok)
      console.error("[capture] delivery status not persisted", update.status);
  } catch {
    console.error("[capture] delivery status unavailable");
  }
  return res
    .status(200)
    .json({
      success: true,
      saved: true,
      emailStatus,
      submissionId,
      results: diagnose(input.answers),
    });
}
