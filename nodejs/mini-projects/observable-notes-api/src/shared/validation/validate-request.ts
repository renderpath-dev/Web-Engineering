import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../errors/http-error.js";

type RequestSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.params) request.params = schemas.params.parse(request.params) as typeof request.params;
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.body) request.body = schemas.body.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, "Request validation failed.", "VALIDATION_FAILED", error.issues));
        return;
      }

      next(error);
    }
  };
}
