import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notebooksController } from "./notebooks.controller.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", notebooksController.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), notebooksController.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), notebooksController.get);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), notebooksController.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), notebooksController.remove);
