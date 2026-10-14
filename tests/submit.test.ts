import test from "node:test";
import assert from "node:assert/strict";
import handler, {
  type ApiRequest,
  type ApiResponse,
  allowRequest,
} from "../api/submit";
import { issueChallenge } from "../shared/server-protection";
import { BUSINESS_TYPES, REVENUES, READINESS } from "../shared/diagnostic";
const base = {
  submissionId: "12345678-1234-4234-8234-123456789012",
  firstName: "Major",
  lastName: "",
  email: "test@example.com",
  telegramOrPhone: "",
  businessType: BUSINESS_TYPES[0],
  revenueRange: REVENUES[0],
  biggestIssue: "",
  readiness: READINESS[0],
  answers: Array(10).fill(1),
  consent: true,
  website: "",
};
const keys = [
  "ENABLE_SUBMISSIONS",
  "AIRTABLE_PAT",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];
async function run(
  body: unknown,
  {
    failSave = false,
    failEmail = false,
    duplicate = false,
    disabled = false,
  } = {},
) {
  const old = Object.fromEntries(keys.map((k) => [k, process.env[k]])),
    original = globalThis.fetch;
  Object.assign(process.env, {
    ENABLE_SUBMISSIONS: disabled ? "false" : "true",
    AIRTABLE_PAT: "mock-secret",
    AIRTABLE_BASE_ID: "appTest",
    AIRTABLE_TABLE_ID: "tblTest",
    RESEND_API_KEY: "mock-key",
    RESEND_FROM_EMAIL: "MAIM <results@example.com>",
  });
  const calls: {
    url: string;
    body: Record<string, any>;
    headers: Record<string, string>;
  }[] = [];
  globalThis.fetch = (async (url, init) => {
    const u = String(url);
    calls.push({
      url: u,
      body: JSON.parse(String(init?.body)),
      headers: init?.headers as Record<string, string>,
    });
    if (u.includes("resend"))
      return new Response(
        JSON.stringify(
          failEmail ? { error: "private provider details" } : { id: "mail123" },
        ),
        { status: failEmail ? 500 : 200 },
      );
    if (calls.length === 1 && failSave)
      return new Response('{"error":"private provider details"}', {
        status: 422,
      });
    return new Response(
      JSON.stringify({
        records: [
          {
            id: "rec123",
            fields: duplicate ? { "Results Email Status": "sent" } : {},
          },
        ],
      }),
      { status: 200 },
    );
  }) as typeof fetch;
  let status = 200,
    value: any;
  const res: ApiResponse = {
    status(code) {
      status = code;
      return this;
    },
    json(v) {
      value = v;
      return v;
    },
    setHeader() {},
  };
  try {
    await handler(
      {
        method: "POST",
        body,
        headers: {
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "x-forwarded-for": crypto.randomUUID(),
        },
      } as ApiRequest,
      res,
    );
    return { status, value, calls };
  } finally {
    globalThis.fetch = original;
    for (const k of keys)
      old[k] === undefined ? delete process.env[k] : (process.env[k] = old[k]);
  }
}
const payload = () => ({
  ...base,
  challenge: issueChallenge("mock-secret", Date.now() - 2000),
});
test("rejected Airtable write returns safe retry error and never emails", async () => {
  const r = await run(payload(), { failSave: true });
  assert.equal(r.status, 502);
  assert.equal(r.calls.length, 1);
  assert.ok(!JSON.stringify(r.value).includes("private provider"));
});
test("awaited email failure preserves saved state and marks retriable failure", async () => {
  const r = await run(payload(), { failEmail: true });
  assert.equal(r.status, 200);
  assert.equal(r.value.saved, true);
  assert.equal(r.value.emailStatus, "failed");
  assert.equal(
    r.calls[2].body.records[0].fields["Results Email Status"],
    "failed",
  );
});
test("upsert and email use stable references across retries", async () => {
  const a = await run(payload()),
    b = await run(payload());
  assert.equal(a.value.emailStatus, "sent");
  assert.equal(
    a.calls[0].body.records[0].fields["Submission ID"],
    b.calls[0].body.records[0].fields["Submission ID"],
  );
  assert.deepEqual(a.calls[0].body.performUpsert, {
    fieldsToMergeOn: ["Submission ID"],
  });
  assert.equal(a.calls[1].headers["Idempotency-Key"], a.value.submissionId);
  assert.equal(a.calls[2].body.records[0].fields.Notes, undefined);
});
test("already-sent record skips repeat email", async () => {
  const r = await run(payload(), { duplicate: true });
  assert.equal(r.calls.length, 1);
  assert.equal(r.value.emailStatus, "sent");
});
test("disabled capture, honeypot and invalid answers cannot write records", async () => {
  const disabled = await run(payload(), { disabled: true });
  assert.equal(disabled.status, 503);
  assert.equal(disabled.calls.length, 0);
  for (const patch of [
    { website: "spam.example" },
    { answers: [] },
    { consent: false },
  ]) {
    const r = await run({ ...payload(), ...patch });
    assert.equal(r.status, 400);
    assert.equal(r.calls.length, 0);
  }
});
test("instance-level throttle rejects bursts and resets after a minute", () => {
  for (let i = 0; i < 6; i++) assert.ok(allowRequest("rate-test", 100));
  assert.ok(!allowRequest("rate-test", 101));
  assert.ok(allowRequest("rate-test", 60200));
});
