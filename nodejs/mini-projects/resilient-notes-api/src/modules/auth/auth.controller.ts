import type { Request, Response } from "express";
import { createCsrfCookie, createSessionCookie, clearSessionCookie } from "../../shared/cookies/session-cookie.js";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(request: Request, response: Response) {
    const result = await authService.register(request.body.email, request.body.password);
    response.setHeader("set-cookie", [createSessionCookie(result.sessionToken, result.expiresAt), createCsrfCookie(result.csrfToken)]);
    sendResponse(response, 201, { user: result.user, csrfToken: result.csrfToken });
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body.email, request.body.password);
    response.setHeader("set-cookie", [createSessionCookie(result.sessionToken, result.expiresAt), createCsrfCookie(result.csrfToken)]);
    sendResponse(response, 200, { user: result.user, csrfToken: result.csrfToken });
  },

  async logout(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    await authService.logout(auth.sessionId);
    response.setHeader("set-cookie", clearSessionCookie());
    sendResponse(response, 204, {});
  },

  me(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { userId: auth.userId, role: auth.role });
  },

  csrf(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { sessionId: auth.sessionId });
  }
};
