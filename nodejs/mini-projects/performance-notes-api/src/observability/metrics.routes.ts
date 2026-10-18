import { Router } from "express";
import { metricsRegistry } from "./metrics.js";
import { sampleEventLoopMetrics } from "./event-loop-metrics.js";
import { refreshMemoryMetrics } from "./memory-metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response, next) => {
  try {
    sampleEventLoopMetrics();
    refreshMemoryMetrics();
    response.type(metricsRegistry.contentType);
    response.send(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
});
