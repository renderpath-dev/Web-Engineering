import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createUserNotebook, deleteUserNotebook, getNotebook, listUserNotebooks, updateUserNotebook } from "./notebooks.service.js";

export const list: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 200, { notebooks: await listUserNotebooks(auth.userId) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await getNotebook(auth.userId, notebookId) });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 201, { notebook: await createUserNotebook(auth.userId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await updateUserNotebook(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    await deleteUserNotebook(auth.userId, notebookId);
    sendSuccess(response, 200, { deleted: true });
  } catch (error) {
    next(error);
  }
};
