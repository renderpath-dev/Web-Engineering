import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notebooks.controller.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", controller.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), controller.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), controller.get);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), controller.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), controller.remove);
