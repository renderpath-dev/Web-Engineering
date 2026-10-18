import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { NotebooksService } from "./notebooks.service.js";

const service = new NotebooksService();

function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export async function list(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebooks: await service.list(getAuthContext(request).userId) });
  } catch (error) {
    next(error);
  }
}

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendCreated(response, { notebook: await service.create(getAuthContext(request).userId, request.body) });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.get(getAuthContext(request).userId, routeParam(request, "notebookId")) });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.update(getAuthContext(request).userId, routeParam(request, "notebookId"), request.body) });
  } catch (error) {
    next(error);
  }
}

export async function remove(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await service.remove(getAuthContext(request).userId, routeParam(request, "notebookId")));
  } catch (error) {
    next(error);
  }
}
