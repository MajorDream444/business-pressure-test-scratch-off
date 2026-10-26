import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lock = JSON.parse(
  readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
);

function parts(version: string): number[] {
  return version.split(".").map((value) => Number(value));
}

function atLeast(actual: string, expected: string): boolean {
  const a = parts(actual), e = parts(expected);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== e[i]) return a[i] > e[i];
  }
  return true;
}

test("runtime HTTP parser dependencies stay above reviewed DoS advisories", () => {
  const bodyParser = lock.packages["node_modules/body-parser"]?.version;
  const qs = lock.packages["node_modules/qs"]?.version;
  assert.ok(bodyParser && atLeast(bodyParser, "1.20.9"), bodyParser);
  assert.ok(qs && atLeast(qs, "6.16.0"), qs);
});
