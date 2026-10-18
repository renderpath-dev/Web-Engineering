import { createHash, randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { sendJson, sendNoContent } from "../../shared/responses/send-response.js";
import type { AuthenticatedRequest } from "./auth.schema.js";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const item of header?.split(";") ?? []) {
    const [rawName, ...rawValue] = item.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join("=")));
  }
  return cookies;
}

function setSessionCookies(response: import("express").Response, sessionToken: string, csrfToken: string): void {
  const common = {
    sameSite: "lax" as const,
    secure: config.COOKIE_SECURE,
    maxAge: config.SESSION_TTL_SECONDS * 1000
  };
  response.cookie(config.SESSION_COOKIE_NAME, sessionToken, { ...common, httpOnly: true });
  response.cookie(config.CSRF_COOKIE_NAME, csrfToken, { ...common, httpOnly: false });
}

export const register: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    const user = await prisma.user.create({
      data: { email, passwordHash: hashValue(password) },
      select: { id: true, email: true, createdAt: true }
    });
    sendJson(response, 201, { user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== hashValue(password)) {
      throw new HttpError(401, "invalid_credentials", "Invalid email or password");
    }

    const sessionToken = randomUUID();
    const csrfToken = randomUUID();
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash: hashValue(sessionToken),
        csrfTokenHash: hashValue(csrfToken),
        expiresAt: new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000)
      }
    });

    setSessionCookies(response, sessionToken, csrfToken);
    sendJson(response, 200, { user: { id: user.id, email: user.email }, sessionId: session.id, csrfToken });
  } catch (error) {
    next(error);
  }
};

export const authenticateSession: RequestHandler = async (request: AuthenticatedRequest, _response, next) => {
  try {
    const cookies = parseCookies(request.header("cookie"));
    const token = cookies.get(config.SESSION_COOKIE_NAME);
    if (!token) throw new HttpError(401, "missing_session", "Session cookie is required");

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: hashValue(token) },
      include: { user: true }
    });
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, "invalid_session", "Session is invalid or expired");
    }

    request.auth = {
      userId: session.userId,
      email: session.user.email,
      sessionId: session.id,
      csrfTokenHash: session.csrfTokenHash
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCsrfToken: RequestHandler = (request: AuthenticatedRequest, _response, next) => {
  const header = request.header("x-csrf-token");
  if (!header || hashValue(header) !== request.auth?.csrfTokenHash) {
    next(new HttpError(403, "csrf_required", "A valid CSRF token is required"));
    return;
  }
  next();
};

export const logout: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    if (request.auth) await prisma.session.deleteMany({ where: { id: request.auth.sessionId } });
    response.clearCookie(config.SESSION_COOKIE_NAME);
    response.clearCookie(config.CSRF_COOKIE_NAME);
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser: RequestHandler = (request: AuthenticatedRequest, response) => {
  sendJson(response, 200, { user: { id: request.auth?.userId, email: request.auth?.email } });
};

export const getCsrfToken: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const csrfToken = randomUUID();
    await prisma.session.update({
      where: { id: request.auth?.sessionId },
      data: { csrfTokenHash: hashValue(csrfToken) }
    });
    response.cookie(config.CSRF_COOKIE_NAME, csrfToken, {
      sameSite: "lax",
      secure: config.COOKIE_SECURE,
      httpOnly: false,
      maxAge: config.SESSION_TTL_SECONDS * 1000
    });
    sendJson(response, 200, { csrfToken });
  } catch (error) {
    next(error);
  }
};
