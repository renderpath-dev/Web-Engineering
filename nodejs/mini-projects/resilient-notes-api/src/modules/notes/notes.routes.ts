import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notesController } from "./notes.controller.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), notesController.get);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), notesController.update);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), notesController.remove);
