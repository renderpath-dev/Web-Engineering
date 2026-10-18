import type { ErrorRequestHandler } from "express";
import { recordProblemResponse } from "../../observability/metrics.js";
import { createProblemDetails } from "./problem-details.js";

export const errorMiddleware: ErrorRequestHandler = (error, request, response, _next) => {
  const problem = createProblemDetails(error, request);
  recordProblemResponse(problem.code, problem.status);
  response.status(problem.status).type("application/problem+json").json(problem);
};
