import test from "node:test";
import assert from "node:assert/strict";
import { buildImportJobId, buildImportJobPayload, IMPORT_TASKS_JOB_NAME, IMPORT_TASKS_PAYLOAD_VERSION } from "../src/queue/job-contract.js";
import { parseImportTasksPayload } from "../src/queue/job-schemas.js";

test("import job contract fixes name, version, and idempotency identity", () => {
  const payload = buildImportJobPayload({
    projectId: "00000000-0000-4000-8000-000000000001",
    idempotencyKey: "job-contract:case-1",
    correlationId: "correlation-case-1",
    tasks: [{ title: "contract task", completed: false }],
    metadata: { source: "test" },
    failureMode: "none"
  });

  assert.equal(payload.name, IMPORT_TASKS_JOB_NAME);
  assert.equal(payload.version, IMPORT_TASKS_PAYLOAD_VERSION);
  assert.equal(buildImportJobId(payload.idempotencyKey), "tasks.import:job-contract:case-1");
  assert.equal(parseImportTasksPayload(payload).tasks.length, 1);
});
