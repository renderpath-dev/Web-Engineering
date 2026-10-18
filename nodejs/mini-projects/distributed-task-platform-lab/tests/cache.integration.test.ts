import test from "node:test";
import assert from "node:assert/strict";
import { getRedisClient, closeRedis } from "../src/redis/redis-client.js";

test("cache integration can set and delete a namespaced Redis key", async (t) => {
  t.after(async () => {
    await closeRedis();
  });

  const client = await getRedisClient();
  const key = "cache:v1:test:integration";
  await client.set(key, "ok", { EX: 10 });
  assert.equal(await client.get(key), "ok");
  await client.del(key);
});
