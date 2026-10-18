import test from "node:test";
import assert from "node:assert/strict";
import { parseImportTasksPayload } from "../src/queue/job-schemas.js";
import { PermanentJobError } from "../src/queue/retry-policy.js";
import { processImportTasksJob } from "../src/worker/processor.js";

test("worker payload validation rejects duplicate titles before processing", () => {
  assert.throws(() => parseImportTasksPayload({
    name: "tasks.import",
    version: "1",
    projectId: "00000000-0000-4000-8000-000000000001",
    idempotencyKey: "worker-unit:1",
    correlationId: "worker-unit-correlation",
    tasks: [{ title: "duplicate" }, { title: "duplicate" }]
  }));
});

test("worker classifies invalid job payload as permanent without reparsing in catch", async () => {
  await assert.rejects(
    () => processImportTasksJob({
      data: {
        name: "tasks.import",
        version: "1",
        projectId: "not-a-uuid",
        tasks: []
      },
      attemptsMade: 0
    } as never),
    PermanentJobError
  );
});
