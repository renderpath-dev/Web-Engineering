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

async function assertNotebookOwner(notebookId: string, userId: string): Promise<void> {
  const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId } });
  if (!notebook) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
}

export const listForNotebook: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    await assertNotebookOwner(notebookId, requireUserId(request));
    const query = request.query as unknown as { limit: number; cursor?: string; sort: "createdAt" | "updatedAt" };
    const notes = await prisma.note.findMany({
      where: { notebookId },
      orderBy: { [query.sort]: "desc" },
      take: query.limit
    });
    sendJson(response, 200, { items: notes, nextCursor: null, limit: query.limit });
  } catch (error) {
    next(error);
  }
};

export const createForNotebook: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    await assertNotebookOwner(notebookId, requireUserId(request));
    const body = request.body as { title: string; body: string };
    const note = await prisma.note.create({
      data: { notebookId, title: body.title, body: body.body }
    });
    sendJson(response, 201, note);
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const note = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!note) throw new HttpError(404, "note_not_found", "Note was not found");
    sendJson(response, 200, note);
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const existing = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!existing) throw new HttpError(404, "note_not_found", "Note was not found");
    const note = await prisma.note.update({
      where: { id: existing.id },
      data: request.body as { title?: string; body?: string }
    });
    sendJson(response, 200, note);
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const existing = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!existing) throw new HttpError(404, "note_not_found", "Note was not found");
    await prisma.note.delete({ where: { id: existing.id } });
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};
