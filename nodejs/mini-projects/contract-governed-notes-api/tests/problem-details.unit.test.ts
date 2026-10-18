import test from "node:test";
import assert from "node:assert/strict";
import { createProblemDetails } from "../src/shared/errors/problem-details.js";
import { HttpError } from "../src/shared/errors/http-error.js";

test("problem details uses query-stripped request path", () => {
  const request = { path: "/v1/notebooks" } as Parameters<typeof createProblemDetails>[1];
  const problem = createProblemDetails(new HttpError(400, "validation_failed", "Invalid field"), request);
  assert.equal(problem.status, 400);
  assert.equal(problem.code, "validation_failed");
  assert.equal(problem.instance, "/v1/notebooks");
});
