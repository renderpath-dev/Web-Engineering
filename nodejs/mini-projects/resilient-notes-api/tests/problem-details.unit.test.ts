import assert from "node:assert/strict";
import test from "node:test";
import { buildProblemDetails } from "../src/reliability/problem-details.js";

test("problem details include safe stable fields", () => {
  const problem = buildProblemDetails({
    status: 504,
    title: "Dependency timeout",
    detail: "Redis command timed out",
    instance: "/health/ready",
    code: "TIMEOUT",
    retryable: true,
    requestId: "request-1"
  });
  assert.equal(problem.type, "https://example.com/problems/timeout");
  assert.equal(problem.status, 504);
  assert.equal(problem.retryable, true);
  assert.equal("stack" in problem, false);
});
