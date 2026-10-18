import type { Request, Response } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { notebooksService } from "./notebooks.service.js";

export const notebooksController = {
  async list(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { notebooks: await notebooksService.list(auth.userId) });
  },

  async create(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 201, { notebook: await notebooksService.create(auth.userId, request.body.name) });
  },

  async get(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, { notebook: await notebooksService.find(auth.userId, notebookId) });
  },

  async update(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, { notebook: await notebooksService.update(auth.userId, notebookId, request.body) });
  },

  async remove(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    await notebooksService.remove(auth.userId, notebookId);
    sendResponse(response, 204, {});
  }
};
