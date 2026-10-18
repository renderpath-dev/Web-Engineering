import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "route_not_found", `No route for ${request.method} ${request.path}`));
};
