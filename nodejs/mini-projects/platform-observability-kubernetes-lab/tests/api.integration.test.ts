import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/api/app.js";
import { loadConfig } from "../src/config/env.js";

function readyProbe(name: string) {
  return {
    name,
    check: async () => ({ name, ready: true, latencyMs: 0, message: "ok" }),
    close: async () => {}
  };
}

test("serves public platform endpoints", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [readyProbe("postgres"), readyProbe("redis")]
  });

  await request(application.app).get("/v1/health/live").expect(200);
  await request(application.app).get("/v1/health/startup").expect(200);
  await request(application.app).get("/v1/simulate/ok").expect(200);
  await request(application.app).get("/v1/simulate/error").expect(503).expect((response) => {
    assert.equal(response.body.code, "simulated_error");
    assert.equal(Object.prototype.hasOwnProperty.call(response.body, "stack"), false);
  });
  await request(application.app).get("/v1/platform/runbook").expect(200);
  await application.close();
});
