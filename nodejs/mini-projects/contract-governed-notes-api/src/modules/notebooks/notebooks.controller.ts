import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { sendJson, sendNoContent } from "../../shared/responses/send-response.js";
import type { AuthenticatedRequest } from "../auth/auth.schema.js";

function requireUserId(request: AuthenticatedRequest): string {
  if (!request.auth?.userId) throw new HttpError(401, "missing_session", "Session is required");
  return request.auth.userId;
}

function paramValue(request: AuthenticatedRequest, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") throw new HttpError(400, "invalid_path_param", `${name} must be a string`);
  return value;
}

export const list: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { userId: requireUserId(request) },
      orderBy: { updatedAt: "desc" }
    });
    sendJson(response, 200, { items: notebooks, nextCursor: null, limit: notebooks.length });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebook = await prisma.notebook.create({
      data: { userId: requireUserId(request), title: (request.body as { title: string }).title }
    });
    sendJson(response, 201, notebook);
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const notebook = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!notebook) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    sendJson(response, 200, notebook);
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const existing = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!existing) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    const notebook = await prisma.notebook.update({
      where: { id: existing.id },
      data: request.body as { title?: string }
    });
    sendJson(response, 200, notebook);
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const existing = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!existing) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    await prisma.notebook.delete({ where: { id: existing.id } });
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};
