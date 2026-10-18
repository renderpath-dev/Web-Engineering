import type { Router } from "express";
import { Router as createRouter } from "express";
import { registry } from "./metrics.js";

export function createMetricsRouter(): Router {
  const router = createRouter();

  router.get("/metrics", async (_request, response) => {
    response.setHeader("content-type", registry.contentType);
    response.send(await registry.metrics());
  });

  return router;
}
