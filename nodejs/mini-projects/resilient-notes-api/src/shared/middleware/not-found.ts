import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";

export function notFound(request: Request, _response: Response, next: NextFunction): void {
  next(new HttpError(404, `Route ${request.method} ${request.path} was not found`, "NOT_FOUND"));
}
