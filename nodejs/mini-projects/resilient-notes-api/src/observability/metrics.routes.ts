import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.setHeader("content-type", metricsRegistry.contentType);
  response.end(await metricsRegistry.metrics());
});
