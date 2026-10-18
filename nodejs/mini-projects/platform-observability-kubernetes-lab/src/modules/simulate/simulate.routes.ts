import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createSloStore } from "../../slo/slo.service.js";
import { createSimulationController } from "./simulate.controller.js";

export function createSimulationRouter(sloStore: ReturnType<typeof createSloStore>): Router {
  const router = createRouter();
  const controller = createSimulationController(sloStore);

  router.get("/ok", controller.ok);
  router.get("/error", controller.error);
  router.get("/slow", controller.slow);
  router.get("/event-loop-delay", controller.eventLoopDelay);
  router.post("/trace-work", controller.traceWork);

  return router;
}
