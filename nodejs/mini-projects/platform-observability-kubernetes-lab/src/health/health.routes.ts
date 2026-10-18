import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createHealthService } from "./health.service.js";

export function createHealthRouter(healthService: ReturnType<typeof createHealthService>): Router {
  const router = createRouter();

  router.get("/live", (_request, response) => {
    response.json(healthService.live());
  });

  router.get("/startup", (_request, response) => {
    response.json(healthService.startup());
  });

  router.get("/ready", async (_request, response) => {
    const snapshot = await healthService.ready();
    response.status(snapshot.status === "ready" ? 200 : 503).json(snapshot);
  });

  return router;
}
