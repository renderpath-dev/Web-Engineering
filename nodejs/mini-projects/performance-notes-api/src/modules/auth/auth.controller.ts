import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { clearSessionCookies, serializeCsrfCookie, serializeSessionCookie } from "../../shared/cookies/session-cookie.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

function setSessionCookies(response: Response, result: { sessionToken: string; csrfToken: string }): void {
  response.setHeader("Set-Cookie", [
    serializeSessionCookie(result.sessionToken),
    serializeCsrfCookie(result.csrfToken)
  ]);
}

export async function register(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.register(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendCreated(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.login(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendOk(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.logout(getAuthContext(request));
    response.setHeader("Set-Cookie", clearSessionCookies());
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { user: await service.me(getAuthContext(request)) });
  } catch (error) {
    next(error);
  }
}

export async function csrf(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.rotateCsrf(getAuthContext(request));
    response.setHeader("Set-Cookie", serializeCsrfCookie(result.csrfToken));
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}
