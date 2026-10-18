import type { Request } from "express";
import { HttpError } from "./http-error.js";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
};

const titlesByStatus = new Map<number, string>([
  [400, "Bad Request"],
  [404, "Not Found"],
  [409, "Conflict"],
  [500, "Internal Server Error"],
  [503, "Service Unavailable"]
]);

export function createProblemDetails(error: unknown, request: Request): ProblemDetails {
  const status = error instanceof HttpError ? error.status : 500;
  const code = error instanceof HttpError ? error.code : "internal_error";
  const detail = error instanceof Error && status < 500 ? error.message : "Unexpected error";

  return {
    type: `https://api.example.test/problems/${code}`,
    title: titlesByStatus.get(status) ?? "Error",
    status,
    detail,
    instance: request.path,
    code
  };
}
