import assert from "node:assert/strict";
import { buildCompatibilityReport } from "../src/contracts/compatibility-report.js";

const report = buildCompatibilityReport();
assert.equal(report.summary.compatible, 2);
assert.equal(report.summary.potentially_compatible, 2);
assert.equal(report.summary.breaking, 7);
console.log("compatibility check passed");
