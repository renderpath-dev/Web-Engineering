import { HttpError } from "../shared/errors/http-error.js";

interface PrismaLikeError {
  code?: string;
}

export function mapPrismaError(error: unknown): HttpError | undefined {
  const candidate = error as PrismaLikeError;

  if (candidate.code === "P2002") {
    return new HttpError(409, "CONFLICT", "Resource already exists.");
  }

  if (candidate.code === "P2025") {
    return new HttpError(404, "NOT_FOUND", "Resource was not found.");
  }

  return undefined;
}
