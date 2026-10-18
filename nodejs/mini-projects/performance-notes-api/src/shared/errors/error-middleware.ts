import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { mapPrismaError } from "../../db/prisma-errors.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const prismaError = mapPrismaError(error);
  const normalized = prismaError ?? error;

  if (normalized instanceof HttpError) {
    response.status(normalized.statusCode).json({
      ok: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details
      }
    });
    return;
  }

  if (normalized instanceof ZodError) {
    response.status(422).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: normalized.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    }
  });
};
