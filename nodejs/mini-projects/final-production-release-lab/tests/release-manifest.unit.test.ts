import assert from "node:assert/strict";
import test from "node:test";
import { generateReleaseManifest } from "../src/release/release-manifest.js";

test("release manifest records local evidence hashes", () => {
  const manifest = generateReleaseManifest({
    auditStatus: "PASS",
    testStatus: "PASS",
    buildStatus: "PASS",
    smokeStatus: "PASS",
    securityCheckStatus: "PASS",
    sbomStatus: "PASS"
  });
  assert.equal(manifest.releaseDecision, "promote");
  assert.notEqual(manifest.dockerfileHash, "UNKNOWN");
});
