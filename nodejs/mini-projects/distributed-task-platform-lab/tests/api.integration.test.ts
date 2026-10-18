import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/api/app.js";
import { disconnectPrisma } from "../src/db/prisma.js";
import { closeTaskQueue } from "../src/queue/task-queue.js";
import { closeRedis } from "../src/redis/redis-client.js";

test("api exposes liveness and architecture boundary without database access", async (t) => {
  t.after(async () => {
    await Promise.allSettled([closeTaskQueue(), closeRedis(), disconnectPrisma()]);
  });

  const live = await request(app).get("/v1/health/live").expect(200);
  assert.equal(live.body.status, "live");

  const boundary = await request(app).get("/v1/architecture/service-boundary").expect(200);
  assert.equal(boundary.body.architecture, "modular-monolith-with-worker-boundary");
});
