import test from "node:test";
import assert from "node:assert/strict";
import { PermanentJobError, TransientJobError, classifyJobFailure, shouldRetryJob } from "../src/queue/retry-policy.js";

test("retry policy separates transient and permanent failures", () => {
  assert.equal(classifyJobFailure(new TransientJobError("temporary")), "transient");
  assert.equal(classifyJobFailure(new PermanentJobError("bad payload")), "permanent");
  assert.equal(shouldRetryJob("transient", 1, 3), true);
  assert.equal(shouldRetryJob("permanent", 1, 3), false);
});
