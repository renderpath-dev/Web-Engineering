import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createTaskSchema, importTasksRequestSchema, taskParamsSchema } from "./tasks.schema.js";
import * as controller from "./tasks.controller.js";

export const tasksRoutes = Router({ mergeParams: true });

tasksRoutes.get("/", validateRequest({ params: taskParamsSchema }), controller.list);
tasksRoutes.post("/", validateRequest({ params: taskParamsSchema, body: createTaskSchema }), controller.create);
tasksRoutes.post("/import", validateRequest({ params: taskParamsSchema, body: importTasksRequestSchema }), controller.importTasks);
