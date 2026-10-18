import { config } from "../../config/env.js";

function serializeCookie(name: string, value: string, options: Record<string, string | number | boolean>): string {
  const attributes = Object.entries(options).flatMap(([key, optionValue]) => {
    if (optionValue === false) return [];
    if (optionValue === true) return [key];
    return [`${key}=${optionValue}`];
  });

  return [`${name}=${encodeURIComponent(value)}`, ...attributes].join("; ");
}

export function serializeSessionCookie(sessionToken: string): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, sessionToken, {
    HttpOnly: true,
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function serializeCsrfCookie(csrfToken: string): string {
  return serializeCookie(config.CSRF_COOKIE_NAME, csrfToken, {
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function clearSessionCookies(): string[] {
  return [
    serializeCookie(config.SESSION_COOKIE_NAME, "", { HttpOnly: true, Path: "/", "Max-Age": 0 }),
    serializeCookie(config.CSRF_COOKIE_NAME, "", { Path: "/", "Max-Age": 0 })
  ];
}
