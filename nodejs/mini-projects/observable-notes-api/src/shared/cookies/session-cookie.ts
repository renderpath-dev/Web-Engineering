import type { Response } from "express";
import { config } from "../../config/env.js";

export function setSessionCookie(response: Response, token: string, expiresAt: Date): void {
  response.cookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    expires: expiresAt,
    path: "/"
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
}

export function setCsrfCookie(response: Response, token: string): void {
  response.cookie(config.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    path: "/"
  });
}
