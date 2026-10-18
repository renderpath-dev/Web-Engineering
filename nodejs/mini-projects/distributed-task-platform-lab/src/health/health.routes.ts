import { Router } from "express";
import { liveStatus, readyStatus } from "./health.service.js";

export const healthRoutes = Router();

healthRoutes.get("/live", async (_request, response) => {
  response.json(await liveStatus());
});

healthRoutes.get("/ready", async (_request, response) => {
  const result = await readyStatus();
  response.status(result.status === "ready" ? 200 : 503).json(result);
});
