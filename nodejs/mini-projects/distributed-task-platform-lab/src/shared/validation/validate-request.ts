import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error.js";

export type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
  headers?: ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.body) request.body = schemas.body.parse(request.body);
      if (schemas.params) Object.assign(request.params, schemas.params.parse(request.params) as Record<string, string>);
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.headers) schemas.headers.parse(request.headers);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(400, "validation_failed", error.issues.map((issue) => issue.message).join("; ")));
        return;
      }
      next(error);
    }
  };
}
