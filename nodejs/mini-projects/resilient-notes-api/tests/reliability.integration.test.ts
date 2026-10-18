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

test("retry demo reaches success through bounded retry", async () => {
  const response = await request(app).get("/reliability/retry-demo").expect(200);
  assert.equal(response.body.mechanism, "retry");
});

test("timeout demo returns problem details instead of hanging", async () => {
  const response = await request(app).get("/reliability/timeout-demo").expect(504);
  assert.equal(response.type, "application/problem+json");
  assert.equal(response.body.code, "TIMEOUT");
});

test("fault injection endpoint is bounded", async () => {
  const response = await request(app)
    .post("/reliability/fault-injection")
    .send({ scenario: "none" })
    .expect(200);
  assert.equal(response.body.mechanism, "fault_injection");
});
