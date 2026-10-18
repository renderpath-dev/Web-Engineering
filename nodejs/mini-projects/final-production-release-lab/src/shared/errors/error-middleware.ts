import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { createProblemDetails } from "./problem-details.js";

function publicMessage(error: unknown): { status: number; title: string; detail: string; code: string } {
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      title: error.code,
      detail: error.expose ? error.message : "The request could not be completed.",
      code: error.code
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      title: "invalid_request",
      detail: "The request body did not match the expected schema.",
      code: "invalid_request"
    };
  }

  return {
    status: 500,
    title: "internal_error",
    detail: "The request could not be completed.",
    code: "internal_error"
  };
}

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const requestId = typeof response.locals.requestId === "string" ? response.locals.requestId : "unknown-request";
  const message = publicMessage(error);

  response.status(message.status).json(createProblemDetails({
    status: message.status,
    title: message.title,
    detail: message.detail,
    instance: request.originalUrl,
    requestId,
    code: message.code
  }));
};
