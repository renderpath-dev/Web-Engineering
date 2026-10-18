import { randomUUID } from "node:crypto";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const key = `check-${randomUUID()}`;
const body = { name: "demo-operation", amount: 1 };

async function post(bodyValue: unknown): Promise<Response> {
  return fetch(`${baseUrl}/reliability/idempotent-operation`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": key
    },
    body: JSON.stringify(bodyValue)
  });
}

const first = await post(body);
if (first.status !== 201) throw new Error(`first request returned ${first.status}`);
const firstBody = (await first.json()) as { operationId: string };

const replay = await post(body);
if (replay.status !== 201) throw new Error(`replay request returned ${replay.status}`);
const replayBody = (await replay.json()) as { operationId: string };
if (firstBody.operationId !== replayBody.operationId) throw new Error("replay returned a different operation id");

const conflict = await post({ name: "changed-operation", amount: 1 });
if (conflict.status !== 409) throw new Error(`conflict request returned ${conflict.status}`);

console.log(`idempotency check ok ${baseUrl}`);
