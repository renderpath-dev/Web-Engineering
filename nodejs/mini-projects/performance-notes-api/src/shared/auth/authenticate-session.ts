import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { AuthRepository } from "../../modules/auth/auth.repository.js";
import { parseCookies } from "../cookies/cookie-parser.js";
import { HttpError } from "../errors/http-error.js";
import { setAuthContext } from "./auth-context.js";
import { hashSessionToken } from "./session-token.js";

const repository = new AuthRepository();

export const authenticateSession: RequestHandler = async (request, _response, next) => {
  try {
    const cookies = parseCookies(request.get("cookie"));
    const sessionToken = cookies[config.SESSION_COOKIE_NAME];
    if (!sessionToken) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    const session = await repository.findActiveSessionByHash(hashSessionToken(sessionToken), new Date());
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    setAuthContext(request, {
      userId: session.userId,
      sessionId: session.id,
      role: session.user.role,
      csrfTokenHash: session.csrfTokenHash
    });

    next();
  } catch (error) {
    next(error);
  }
};
