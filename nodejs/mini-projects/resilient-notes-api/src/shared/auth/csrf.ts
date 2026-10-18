import type { NextFunction, Request, Response } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { readCookie } from "../cookies/session-cookie.js";
import { HttpError } from "../errors/http-error.js";
import { requireAuthContext } from "./auth-context.js";
import { hashToken } from "./session-token.js";

export async function requireCsrfToken(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(request);
    const headerToken = request.get("x-csrf-token");
    const cookieToken = readCookie(request.headers.cookie, config.CSRF_COOKIE_NAME);
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      next(new HttpError(403, "CSRF token is invalid", "FORBIDDEN"));
      return;
    }

    const session = await prisma.session.findUnique({ where: { id: auth.sessionId } });
    if (!session?.csrfTokenHash || session.csrfTokenHash !== hashToken(headerToken)) {
      next(new HttpError(403, "CSRF token is invalid", "FORBIDDEN"));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
