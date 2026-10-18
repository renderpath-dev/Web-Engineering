import type { Router } from "express";
import { Router as createRouter } from "express";
import { kubernetesModel } from "./kubernetes-model.js";
import { runbook } from "./runbook.js";

export function createPlatformRouter(): Router {
  const router = createRouter();

  router.get("/runbook", (_request, response) => {
    response.json({ runbook });
  });

  router.get("/kubernetes-model", (_request, response) => {
    response.json(kubernetesModel);
  });

  return router;
}
