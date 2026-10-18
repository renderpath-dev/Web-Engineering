import assert from "node:assert/strict";
import test, { after } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { closeDatabase } from "./helpers/database.js";
import { closeRedis } from "./helpers/redis.js";

after(async () => {
  await closeRedis();
  await closeDatabase();
});

test("liveness endpoint responds without dependency checks", async () => {
  const response = await request(app).get("/health/live").expect(200);
  assert.equal(response.body.status, "live");
});

test("readiness endpoint returns a dependency status document", async () => {
  const response = await request(app).get("/health/ready");
  assert.ok([200, 503].includes(response.status));
  assert.ok(Array.isArray(response.body.dependencies));
});
