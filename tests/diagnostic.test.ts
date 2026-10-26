import test from "node:test";
import assert from "node:assert/strict";
import {
  diagnose,
  validateSubmission,
  toFields,
  BUSINESS_TYPES,
  REVENUES,
  READINESS,
} from "../shared/diagnostic";
import { buildEmail, safeUrl } from "../shared/email-template";
import { issueChallenge, validChallenge } from "../shared/server-protection";
export const input = {
  submissionId: "12345678-1234-4234-8234-123456789012",
  firstName: "Major",
  lastName: "Williams",
  email: "test@example.com",
  telegramOrPhone: "",
  businessType: BUSINESS_TYPES[0],
  revenueRange: REVENUES[0],
  biggestIssue: "",
  readiness: READINESS[0],
  answers: Array(10).fill(1),
  consent: true,
  website: "",
  challenge: "test",
};
test("all bands cover exact fractional scores with no fallback gap", () => {
  assert.equal(diagnose(Array(10).fill(0)).totalScore, 0);
  assert.equal(diagnose(Array(10).fill(4)).totalScore, 100);
  for (let units = 0; units <= 40; units++) {
    let remaining = units;
    const answers = Array.from({ length: 10 }, () => {
      const a = Math.min(4, remaining);
      remaining -= a;
      return a;
    });
    const d = diagnose(answers);
    assert.equal(d.totalScore, units * 2.5);
    assert.equal(
      d.scoreBand,
      units <= 10
        ? "Critical"
        : units <= 20
          ? "Leaking"
          : units <= 30
            ? "Functional"
            : "Strong",
    );
  }
});
test("same total with different weak answers produces different primary signals", () => {
  const a = Array(10).fill(3),
    b = Array(10).fill(3);
  a[2] = 0;
  b[4] = 0;
  assert.equal(diagnose(a).totalScore, diagnose(b).totalScore);
  assert.equal(diagnose(a).primaryLeak, "Offer");
  assert.equal(diagnose(b).primaryLeak, "Follow-up");
});
test("runtime validation rejects missing answers, invalid choices, missing consent, bad email and injected header characters", () => {
  for (const patch of [
    { answers: [] },
    { answers: Array(10).fill(5) },
    { answers: Array(10).fill("1") },
    { consent: false },
    { email: "not-email" },
    { firstName: "x\r\nBcc:bad" },
  ])
    assert.throws(() => validateSubmission({ ...input, ...patch }));
  assert.equal(
    validateSubmission({ ...input, totalScore: 999 }).email,
    "test@example.com",
  );
});
test("server derives scores and readiness rather than trusting supplied totals", () => {
  const fields = toFields(
    validateSubmission({
      ...input,
      totalScore: 999,
      priority: "HOT",
      readiness: READINESS[0],
    }),
  );
  assert.equal(fields["Total Score"], 25);
  assert.equal(fields["Score Q1"], 2.5);
  assert.equal(fields.Priority, "COLD");
  assert.equal(toFields({ ...input, readiness: READINESS[2] }).Priority, "HOT");
});
test("email escapes user HTML and rejects unsafe booking links", () => {
  const e = buildEmail(
    { ...input, firstName: "<img src=x onerror=alert(1)>" },
    "javascript:alert(1)",
  );
  assert.ok(e.html.includes("&lt;img"));
  assert.ok(!e.html.includes("<img src=x"));
  assert.ok(!e.html.includes("javascript:"));
  assert.equal(safeUrl("http://example.com"), "");
  assert.ok(safeUrl("https://example.com"));
});
test("signed challenge rejects forgery, immediate automated posts and expired tokens", () => {
  const token = issueChallenge("test-secret", 1000000000000);
  assert.ok(validChallenge(token, "test-secret", 1000000002000));
  assert.ok(!validChallenge(token, "wrong", 1000000002000));
  assert.ok(!validChallenge(token, "test-secret", 1000000000500));
  assert.ok(!validChallenge(token, "test-secret", 1000003600000));
});
