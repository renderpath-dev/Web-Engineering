import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { projectParamsSchema } from "../projects/projects.schema.js";
import * as controller from "./cache-demo.controller.js";

export const cacheDemoRoutes = Router();

cacheDemoRoutes.get("/projects/:projectId/summary", validateRequest({ params: projectParamsSchema }), controller.summary);
cacheDemoRoutes.post("/projects/:projectId/invalidate", validateRequest({ params: projectParamsSchema }), controller.invalidate);
