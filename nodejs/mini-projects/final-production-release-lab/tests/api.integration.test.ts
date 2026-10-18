import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";

test("health and release endpoints respond", async () => {
  const app = createApp();
  const health = await request(app).get("/v1/health/ready").expect(200);
  assert.equal(health.body.status, "ok");

  const manifest = await request(app).get("/v1/release/manifest").expect(200);
  assert.equal(typeof manifest.body.releaseDecision, "string");
});

test("release evaluation rejects missing evidence as hold", async () => {
  const app = createApp();
  const response = await request(app)
    .post("/v1/release/evaluate")
    .send({
      phase: "pre-release",
      signals: [
        { name: "test", status: "UNKNOWN", required: true, critical: false, evidence: "npm test" }
      ]
    })
    .expect(200);
  assert.equal(response.body.decision, "hold");
});
