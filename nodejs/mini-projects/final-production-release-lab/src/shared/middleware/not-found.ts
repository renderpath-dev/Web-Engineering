import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "not_found", "The requested resource was not found.", { expose: true, details: { path: request.path } }));
};
