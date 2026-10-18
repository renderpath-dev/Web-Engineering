import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const incoming = request.header("x-request-id");
  const requestId = incoming && /^[a-zA-Z0-9_.:-]{8,128}$/.test(incoming) ? incoming : randomUUID();
  request.id = requestId;
  response.setHeader("x-request-id", requestId);
  next();
};

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
