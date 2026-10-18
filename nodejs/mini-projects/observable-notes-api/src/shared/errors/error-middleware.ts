import type { ErrorRequestHandler } from "express";
import { getRequestId } from "../../observability/request-context.js";
import { toSafePrismaErrorCode } from "../../db/prisma-errors.js";
import { isHttpError } from "./http-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isHttpError(error)) {
    response.status(error.status).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? []
      },
      meta: { requestId: getRequestId() }
    });
    return;
  }

  const prismaCode = toSafePrismaErrorCode(error);
  if (prismaCode) {
    response.status(409).json({
      ok: false,
      error: {
        code: prismaCode,
        message: "Database constraint violation.",
        details: []
      },
      meta: { requestId: getRequestId() }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    },
    meta: { requestId: getRequestId() }
  });
};
