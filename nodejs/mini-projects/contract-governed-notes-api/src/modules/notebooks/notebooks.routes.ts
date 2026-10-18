import { Router } from "express";
import { requireCsrfToken } from "../auth/auth.controller.js";
import { create, getById, list, removeById, updateById } from "./notebooks.controller.js";
import { createNotebookBodySchema, notebookParamsSchema, updateNotebookBodySchema } from "./notebooks.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookBodySchema }), create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), getById);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookBodySchema }), updateById);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), removeById);
