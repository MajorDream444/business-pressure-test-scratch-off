import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
export function issueChallenge(secret: string, now = Date.now()) {
  const value = `${now}.${randomBytes(12).toString("hex")}`;
  return `${value}.${createHmac("sha256", secret).update(value).digest("hex")}`;
}
export function validChallenge(
  token: string,
  secret: string,
  now = Date.now(),
) {
  const parts = token.split(".");
  if (
    parts.length !== 3 ||
    !/^\d{13}$/.test(parts[0]) ||
    !/^[a-f0-9]{24}$/.test(parts[1]) ||
    !/^[a-f0-9]{64}$/.test(parts[2])
  )
    return false;
  const age = now - Number(parts[0]);
  if (age < 1000 || age > 30 * 60 * 1000) return false;
  const expected = createHmac("sha256", secret)
    .update(parts.slice(0, 2).join("."))
    .digest();
  return timingSafeEqual(Buffer.from(parts[2], "hex"), expected);
}
