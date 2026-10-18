import assert from "node:assert/strict";
import test from "node:test";
import { isPlaceholderValue, scanTextForSecrets } from "../src/security/secret-scanner.js";

test("secret scanner allows placeholders", () => {
  assert.equal(isPlaceholderValue("placeholder-api-token"), true);
  assert.equal(scanTextForSecrets(".env.example", "API_TOKEN=placeholder-api-token").length, 0);
});

test("secret scanner detects token-like values without printing them", () => {
  const token = ["g", "h", "p", "_", "samplevalue"].join("");
  const findings = scanTextForSecrets("sample.txt", "TOKEN=" + token);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.kind, "github_token");
});
