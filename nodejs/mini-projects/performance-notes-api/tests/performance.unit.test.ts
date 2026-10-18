import test from "node:test";
import assert from "node:assert/strict";
import { iterationsForSize, runCpuTaskSync } from "../src/modules/performance/cpu-task.service.js";
import { readMemorySample } from "../src/modules/performance/memory-sample.service.js";

test("CPU demo uses bounded input sizes", () => {
  assert.equal(iterationsForSize("small") < iterationsForSize("medium"), true);
  const result = runCpuTaskSync("small");
  assert.equal(result.mode, "sync");
  assert.equal(result.size, "small");
});

test("memory sample does not expose secrets or heap snapshot files", () => {
  const sample = readMemorySample();
  assert.equal(typeof sample.process.rss, "number");
  assert.equal("DATABASE_URL" in sample, false);
});
