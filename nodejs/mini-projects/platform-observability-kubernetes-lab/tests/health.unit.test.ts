import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { createHealthService } from "../src/health/health.service.js";

test("startup health moves from starting to started after grace period", async () => {
  const healthService = createHealthService({ STARTUP_GRACE_MS: 30 }, []);
  assert.equal(healthService.startup().status, "starting");
  await wait(40);
  assert.equal(healthService.startup().status, "started");
});
