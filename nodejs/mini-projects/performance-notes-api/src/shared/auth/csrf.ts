import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { getAuthContext } from "./auth-context.js";
import { HttpError } from "../errors/http-error.js";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(csrfToken: string): string {
  return createHash("sha256").update(csrfToken).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export const requireCsrfToken: RequestHandler = (request, _response, next) => {
  const auth = getAuthContext(request);
  const csrfToken = request.get("x-csrf-token");

  if (!csrfToken || !auth.csrfTokenHash) {
    next(new HttpError(403, "CSRF_REQUIRED", "A CSRF token is required."));
    return;
  }

  if (!safeEqualHex(hashCsrfToken(csrfToken), auth.csrfTokenHash)) {
    next(new HttpError(403, "CSRF_INVALID", "The CSRF token is invalid."));
    return;
  }

  next();
};
