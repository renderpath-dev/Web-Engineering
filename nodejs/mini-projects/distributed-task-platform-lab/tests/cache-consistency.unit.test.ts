import test from "node:test";
import assert from "node:assert/strict";
import { projectSummaryCacheKey } from "../src/cache/cache-keys.js";
import { loadOncePerKey } from "../src/cache/stampede-guard.js";

test("cache keys are namespaced and stampede guard shares one loader", async () => {
  const key = projectSummaryCacheKey("00000000-0000-4000-8000-000000000001");
  assert.equal(key, "cache:v1:project-summary:00000000-0000-4000-8000-000000000001");

  let calls = 0;
  const [first, second] = await Promise.all([
    loadOncePerKey("guard:test", async () => {
      calls += 1;
      return "value";
    }),
    loadOncePerKey("guard:test", async () => {
      calls += 1;
      return "value";
    })
  ]);

  assert.equal(first, "value");
  assert.equal(second, "value");
  assert.equal(calls, 1);
});
