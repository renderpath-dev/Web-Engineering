import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { disconnectPrisma } from "../src/db/prisma.js";
import { stopEventLoopMetrics } from "../src/observability/event-loop-metrics.js";
import { closeRedisClient } from "../src/redis/redis-client.js";

test.after(async () => {
  stopEventLoopMetrics();
  await closeRedisClient();
  await disconnectPrisma();
});

test("GET /health/live does not require PostgreSQL or Redis", async () => {
  const response = await request(createApp()).get("/health/live").expect(200);

  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.status, "live");
  assert.equal(typeof response.body.data.uptimeSeconds, "number");
});

test("GET /health/ready reports dependency state", async () => {
  const response = await request(createApp()).get("/health/ready");

  assert.ok([200, 503].includes(response.status));
  assert.ok(["ready", "not_ready"].includes(response.body.data.status));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.postgres));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.redis));
});
