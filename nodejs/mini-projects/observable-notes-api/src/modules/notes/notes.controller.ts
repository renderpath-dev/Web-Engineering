import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createNotebookNote, deleteUserNote, getNote, listNotebookNotes, updateUserNote } from "./notes.service.js";

export const listForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notes: await listNotebookNotes(auth.userId, notebookId, request.query as never) });
  } catch (error) {
    next(error);
  }
};

export const createForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 201, { note: await createNotebookNote(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await getNote(auth.userId, noteId) });
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await updateUserNote(auth.userId, noteId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    await deleteUserNote(auth.userId, noteId);
    sendSuccess(response, 200, { deleted: true });
  } catch (error) {
    next(error);
  }
};
