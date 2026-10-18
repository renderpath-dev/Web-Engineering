import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`));
};
