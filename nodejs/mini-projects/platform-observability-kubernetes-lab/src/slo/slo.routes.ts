import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createSloStore } from "./slo.service.js";

export function createSloRouter(sloStore: ReturnType<typeof createSloStore>): Router {
  const router = createRouter();

  router.get("/policy", (_request, response) => {
    response.json(sloStore.policy);
  });

  router.get("/report", (_request, response) => {
    response.json(sloStore.report());
  });

  return router;
}
