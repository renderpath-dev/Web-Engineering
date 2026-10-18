import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(request: Request, response: Response, next: NextFunction): void {
  request.id = request.get("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", request.id);
  next();
}
