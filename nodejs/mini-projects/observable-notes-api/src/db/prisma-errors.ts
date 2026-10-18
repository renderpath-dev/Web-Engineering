import { Prisma } from "../generated/prisma/client.js";

export function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function toSafePrismaErrorCode(error: unknown): string | undefined {
  if (!isPrismaKnownRequestError(error)) return undefined;
  return error.code;
}
