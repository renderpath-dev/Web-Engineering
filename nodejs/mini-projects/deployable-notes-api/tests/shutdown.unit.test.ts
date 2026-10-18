import { createServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createGracefulShutdown } from "../src/server.js";

test("createGracefulShutdown closes the HTTP server and resources", async () => {
  const server = createServer((_request, response) => {
    response.end("ok");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  let resourceClosed = false;
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: 1000,
    resources: [
      {
        name: "test-resource",
        close: () => {
          resourceClosed = true;
        }
      }
    ]
  });

  await shutdown("SIGTERM");
  assert.equal(resourceClosed, true);
  assert.equal(server.listening, false);
});
