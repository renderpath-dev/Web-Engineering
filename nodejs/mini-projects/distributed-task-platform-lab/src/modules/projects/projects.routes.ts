import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createProjectSchema, projectParamsSchema } from "./projects.schema.js";
import * as controller from "./projects.controller.js";

export const projectsRoutes = Router();

projectsRoutes.get("/", controller.list);
projectsRoutes.post("/", validateRequest({ body: createProjectSchema }), controller.create);
projectsRoutes.get("/:projectId", validateRequest({ params: projectParamsSchema }), controller.getById);
projectsRoutes.get("/:projectId/summary", validateRequest({ params: projectParamsSchema }), controller.summary);
