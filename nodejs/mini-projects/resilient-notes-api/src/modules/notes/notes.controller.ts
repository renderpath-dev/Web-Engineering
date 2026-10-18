import type { Request, Response } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { notesService } from "./notes.service.js";

export const notesController = {
  async listForNotebook(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, {
      notes: await notesService.listForNotebook(auth.userId, notebookId)
    });
  },

  async createForNotebook(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 201, {
      note: await notesService.create(auth.userId, notebookId, request.body)
    });
  },

  async get(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    sendResponse(response, 200, { note: await notesService.find(auth.userId, noteId) });
  },

  async update(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    sendResponse(response, 200, { note: await notesService.update(auth.userId, noteId, request.body) });
  },

  async remove(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    await notesService.remove(auth.userId, noteId);
    sendResponse(response, 204, {});
  }
};
