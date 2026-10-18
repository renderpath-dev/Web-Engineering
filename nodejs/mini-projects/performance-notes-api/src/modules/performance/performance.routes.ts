import { Router } from "express";
import * as controller from "./performance.controller.js";

export const performanceRoutes = Router();

performanceRoutes.get("/event-loop", controller.eventLoop);
performanceRoutes.get("/memory", controller.memory);
performanceRoutes.get("/cpu-sync", controller.cpuSync);
performanceRoutes.get("/cpu-worker", controller.cpuWorker);
performanceRoutes.get("/stream-report", controller.streamReport);
performanceRoutes.get("/redis-pipeline-demo", controller.redisPipelineDemo);
performanceRoutes.get("/query-summary", controller.querySummary);
