import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
};

export class PublicProblem extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function problemResponse(request: Request, problem: PublicProblem): ProblemDetails {
  return {
    type: "about:blank",
    title: problem.code,
    status: problem.status,
    detail: problem.message,
    instance: request.originalUrl,
    code: problem.code
  };
}

export function notFoundHandler(request: Request, response: Response): void {
  const problem = new PublicProblem(404, "not_found", "Route not found");
  response.status(problem.status).json(problemResponse(request, problem));
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (response.headersSent) {
    return;
  }
  if (error instanceof ZodError) {
    const problem = new PublicProblem(400, "invalid_request", "Request validation failed");
    response.status(problem.status).json(problemResponse(request, problem));
    return;
  }
  if (error instanceof PublicProblem) {
    response.status(error.status).json(problemResponse(request, error));
    return;
  }
  const problem = new PublicProblem(500, "internal_error", "Unexpected server error");
  response.status(problem.status).json(problemResponse(request, problem));
};
