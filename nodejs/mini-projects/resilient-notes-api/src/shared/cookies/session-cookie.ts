import { config } from "../../config/env.js";

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  return parseCookieHeader(header)[name];
}

export function createSessionCookie(token: string, expiresAt: Date): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE,
    expires: expiresAt
  });
}

export function createCsrfCookie(token: string): string {
  return serializeCookie(config.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE
  });
}

export function clearSessionCookie(): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE,
    expires: new Date(0)
  });
}

function serializeCookie(
  name: string,
  value: string,
  options: { httpOnly: boolean; sameSite: "Lax"; secure: boolean; expires?: Date }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", `SameSite=${options.sameSite}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join("; ");
}
