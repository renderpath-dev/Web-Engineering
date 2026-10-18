import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("live health does not require dependencies", async () => {
  const response = await request(app).get("/health/live").expect(200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.status, "live");
});

test("ready health returns safe dependency status", async () => {
  const response = await request(app).get("/health/ready");
  assert.ok([200, 503].includes(response.status));
  const body = JSON.stringify(response.body);
  assert.equal(body.includes("DATABASE_URL"), false);
  assert.equal(body.includes("REDIS_URL"), false);
  assert.equal(body.includes("postgresql://"), false);
  assert.equal(body.includes("redis://"), false);
});
