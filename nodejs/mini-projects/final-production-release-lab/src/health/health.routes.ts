import { Router } from "express";
import { getHealth } from "./health.service.js";

export const healthRouter = Router();

healthRouter.get("/live", (_request, response) => {
  response.json(getHealth());
});

healthRouter.get("/ready", (_request, response) => {
  response.json({
    ...getHealth(),
    checks: {
      process: "ready",
      releaseEvidence: "available"
    }
  });
});
