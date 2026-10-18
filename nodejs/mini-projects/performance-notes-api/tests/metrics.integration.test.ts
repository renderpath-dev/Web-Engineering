import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /metrics exposes low-cardinality performance metrics", async () => {
  await request(createApp()).get("/health/live").expect(200);
  const response = await request(createApp()).get("/metrics").expect(200);

  assert.match(response.text, /http_requests_total/);
  assert.match(response.text, /node_event_loop_delay_seconds/);
  assert.doesNotMatch(response.text, /user_id|note_id|session_id|email|request_id/);
});
