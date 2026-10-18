import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";
import { loadConfig } from "../src/config/env.js";

function probe(name: string, ready: boolean) {
  return {
    name,
    check: async () => ({ name, ready, latencyMs: 0, message: ready ? "ok" : "unavailable" }),
    close: async () => {}
  };
}

test("ready endpoint succeeds when dependencies are ready", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [probe("postgres", true), probe("redis", true)]
  });
  await request(application.app).get("/v1/health/ready").expect(200);
  await application.close();
});

test("ready endpoint fails when a dependency is unavailable", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [probe("postgres", false), probe("redis", true)]
  });
  await request(application.app).get("/v1/health/ready").expect(503);
  await application.close();
});
