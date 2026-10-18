import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";

test("security policy endpoint exposes safe policy signals", async () => {
  const response = await request(createApp()).get("/v1/security/policy").expect(200);
  assert.equal(response.body.headers, "helmet");
});

test("public errors do not expose stack traces", async () => {
  const response = await request(createApp()).get("/missing-route").expect(404);
  assert.equal(typeof response.body.stack, "undefined");
  assert.equal(response.body.code, "not_found");
});

test("secret scan endpoint returns finding metadata only", async () => {
  const token = ["s", "k", "_", "l", "i", "v", "e", "_", "samplevalue"].join("");
  const response = await request(createApp())
    .post("/v1/security/scan-secret")
    .send({ filePath: "input.txt", text: "TOKEN=" + token })
    .expect(200);
  assert.equal(response.body.status, "FAIL");
  assert.equal(response.body.findings[0].kind, "stripe_live_secret");
  assert.equal(JSON.stringify(response.body).includes(token), false);
});
