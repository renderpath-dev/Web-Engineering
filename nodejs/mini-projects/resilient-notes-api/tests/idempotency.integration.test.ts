import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { closeDatabase, resetReliabilityTables } from "./helpers/database.js";
import { closeRedis } from "./helpers/redis.js";

before(async () => {
  await resetReliabilityTables();
});

after(async () => {
  await resetReliabilityTables();
  await closeRedis();
  await closeDatabase();
});

test("unsafe post replays the same result for the same idempotency key", async () => {
  const key = "integration-key-123";
  const body = { name: "integration", amount: 1 };
  const first = await request(app)
    .post("/reliability/idempotent-operation")
    .set("idempotency-key", key)
    .send(body)
    .expect(201);
  const replay = await request(app)
    .post("/reliability/idempotent-operation")
    .set("idempotency-key", key)
    .send(body)
    .expect(201);

  assert.equal(first.body.operationId, replay.body.operationId);
  assert.equal(replay.headers["idempotency-replayed"], "true");
});
