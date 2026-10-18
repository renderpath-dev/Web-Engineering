import type { RequestHandler } from "express";
import { issueCsrfTokenForSession } from "../../shared/auth/csrf.js";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { setSessionCookie, clearSessionCookie, setCsrfCookie } from "../../shared/cookies/session-cookie.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { login, logout, register } from "./auth.service.js";

const requestMeta = (request: Parameters<RequestHandler>[0]) => ({
  userAgent: request.header("user-agent") ?? undefined,
  ip: request.ip
});

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const result = await register(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 201, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const result = await login(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 200, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    await logout(auth.sessionId);
    clearSessionCookie(response);
    sendSuccess(response, 200, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = (_request, response) => {
  const auth = requireAuthContext(response);
  sendSuccess(response, 200, { user: { id: auth.userId, email: auth.email, role: auth.role } });
};

export const csrfController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const csrfToken = await issueCsrfTokenForSession(auth.sessionId);
    setCsrfCookie(response, csrfToken);
    sendSuccess(response, 200, { csrfToken });
  } catch (error) {
    next(error);
  }
};
