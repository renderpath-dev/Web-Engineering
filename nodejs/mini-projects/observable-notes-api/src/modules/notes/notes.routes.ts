import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";
import * as controller from "./notes.controller.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), controller.getById);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), controller.updateById);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), controller.removeById);
