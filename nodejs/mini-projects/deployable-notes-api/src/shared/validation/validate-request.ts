import type { NextFunction, Request, RequestHandler, Response } from "express";

interface RuntimeSchema {
  parse(input: unknown): unknown;
}

export interface RequestSchemas {
  body?: RuntimeSchema;
  params?: RuntimeSchema;
  query?: RuntimeSchema;
}

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.body) request.body = schemas.body.parse(request.body);
    if (schemas.params) request.params = schemas.params.parse(request.params) as Request["params"];
    if (schemas.query) {
      Object.defineProperty(request, "query", {
        value: schemas.query.parse(request.query),
        configurable: true
      });
    }
    next();
  };
}
