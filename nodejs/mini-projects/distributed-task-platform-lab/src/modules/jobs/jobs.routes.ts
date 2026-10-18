import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { jobParamsSchema } from "./jobs.schema.js";
import * as controller from "./jobs.controller.js";

export const jobsRoutes = Router();

jobsRoutes.get("/:jobId", validateRequest({ params: jobParamsSchema }), controller.getById);
jobsRoutes.get("/:jobId/events", validateRequest({ params: jobParamsSchema }), controller.events);
jobsRoutes.post("/:jobId/retry", validateRequest({ params: jobParamsSchema }), controller.retry);
