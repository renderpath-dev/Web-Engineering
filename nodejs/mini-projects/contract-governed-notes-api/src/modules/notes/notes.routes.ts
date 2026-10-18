import { Router } from "express";
import { requireCsrfToken } from "../auth/auth.controller.js";
import { createForNotebook, getById, listForNotebook, removeById, updateById } from "./notes.controller.js";
import { createNoteBodySchema, notebookNoteParamsSchema, noteParamsSchema, noteQuerySchema, updateNoteBodySchema } from "./notes.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const notebookNotesRoutes = Router({ mergeParams: true });
export const notesRoutes = Router();

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema, query: noteQuerySchema }), listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteBodySchema }), createForNotebook);

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), getById);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteBodySchema }), updateById);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), removeById);
