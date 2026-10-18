import test from "node:test";
import assert from "node:assert/strict";
import { migrationPlan } from "../src/architecture/migration-plan.js";
import { serviceBoundaryModel } from "../src/architecture/service-boundary.js";

test("api and worker service responsibilities are separated", () => {
  assert.ok(serviceBoundaryModel.apiService.owns.includes("job creation"));
  assert.ok(serviceBoundaryModel.workerService.owns.includes("job processing"));
  assert.ok(migrationPlan.some((step) => step.step.includes("worker")));
});
