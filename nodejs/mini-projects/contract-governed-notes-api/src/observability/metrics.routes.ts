import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.type(metricsRegistry.contentType);
  response.send(await metricsRegistry.metrics());
});
