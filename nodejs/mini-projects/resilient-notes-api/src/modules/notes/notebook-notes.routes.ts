import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notesController } from "./notes.controller.js";
import { createNoteSchema, notebookNoteParamsSchema } from "./notes.schema.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema }), notesController.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), notesController.createForNotebook);
