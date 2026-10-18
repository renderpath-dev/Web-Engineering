import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.setHeader("content-type", metricsRegistry.contentType);
  response.status(200).send(await metricsRegistry.metrics());
});
