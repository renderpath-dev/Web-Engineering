import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response, next) => {
  try {
    response.setHeader("content-type", metricsRegistry.contentType);
    response.send(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
});
