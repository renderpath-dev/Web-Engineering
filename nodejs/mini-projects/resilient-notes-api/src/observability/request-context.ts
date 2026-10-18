import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";

export interface RequestContext {
  requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function requestContext(request: Request, _response: Response, next: NextFunction): void {
  requestContextStorage.run({ requestId: request.id }, next);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
