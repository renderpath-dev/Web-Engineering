import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export interface RequestSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export function validateRequest(schemas: RequestSchemas) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      if (schemas.body) request.body = schemas.body.parse(request.body);
      if (schemas.params) request.params = schemas.params.parse(request.params) as Request["params"];
      if (schemas.query) request.query = schemas.query.parse(request.query) as Request["query"];
      next();
    } catch (error) {
      next(error);
    }
  };
}
