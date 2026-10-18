import { createClient } from "redis";

export function createObservedRedisClient(url: string) {
  const client = createClient({ url });
  client.on("error", (error) => {
    console.error({ dependency: "redis", message: error.message });
  });
  return client;
}
