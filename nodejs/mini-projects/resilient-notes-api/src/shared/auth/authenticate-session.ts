import type { NextFunction, Request, Response } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { readCookie } from "../cookies/session-cookie.js";
import { hashToken } from "./session-token.js";

export async function authenticateSession(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const token = readCookie(request.headers.cookie, config.SESSION_COOKIE_NAME);
  if (!token) {
    next(new HttpError(401, "Authentication required", "AUTHENTICATION_REQUIRED"));
    return;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    next(new HttpError(401, "Authentication required", "AUTHENTICATION_REQUIRED"));
    return;
  }

  (request as Request & { auth: { userId: string; sessionId: string; role: "USER" | "ADMIN" } }).auth = {
    userId: session.userId,
    sessionId: session.id,
    role: session.user.role
  };
  next();
}
