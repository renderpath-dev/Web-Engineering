import { Router } from "express";
import { liveHealth, readyHealth } from "./health.service.js";

export const healthRoutes = Router();

healthRoutes.get("/live", (_request, response) => {
  response.status(200).json(liveHealth());
});

healthRoutes.get("/ready", async (_request, response) => {
  const body = await readyHealth();
  response.status(body.status === "ready" ? 200 : 503).json(body);
});
