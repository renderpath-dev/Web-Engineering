import assert from "node:assert/strict";
import { runContractReleaseGate } from "../src/contracts/contract-release-gate.js";

const result = await runContractReleaseGate();
assert.deepEqual(result.failures, []);
assert.equal(result.passed, true);
console.log("contract check passed");
