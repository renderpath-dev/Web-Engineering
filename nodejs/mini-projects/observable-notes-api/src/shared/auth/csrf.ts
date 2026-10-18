import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { requireAuthContext } from "./auth-context.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(token: string): string {
  return createHash("sha256").update("csrf:" + token, "utf8").digest("base64url");
}

export async function issueCsrfTokenForSession(sessionId: string): Promise<string> {
  const token = createCsrfToken();
  await prisma.session.update({
    where: { id: sessionId },
    data: { csrfTokenHash: hashCsrfToken(token) }
  });
  return token;
}

export const requireCsrfToken: RequestHandler = async (request, response, next) => {
  try {
    if (SAFE_METHODS.has(request.method)) {
      next();
      return;
    }

    const auth = requireAuthContext(response);
    const token = request.header("x-csrf-token");
    if (!token) {
      throw new HttpError(403, "CSRF token is required.", "CSRF_REQUIRED");
    }

    const session = await prisma.session.findUnique({
      where: { id: auth.sessionId },
      select: { csrfTokenHash: true }
    });

    if (!session?.csrfTokenHash || !isHashMatch(hashCsrfToken(token), session.csrfTokenHash)) {
      throw new HttpError(403, "CSRF token is invalid.", "CSRF_INVALID");
    }

    next();
  } catch (error) {
    next(error);
  }
};

function isHashMatch(candidateHash: string, expectedHash: string): boolean {
  const candidate = Buffer.from(candidateHash, "base64url");
  const expected = Buffer.from(expectedHash, "base64url");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
