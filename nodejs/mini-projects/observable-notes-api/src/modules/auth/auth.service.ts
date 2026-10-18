import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import { createSession, createUser, findUserByEmail, revokeSession } from "./auth.repository.js";
import type { AuthResult, PublicUserDto } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: PublicUserDto["role"] }): PublicUserDto {
  return { id: user.id, email: user.email, role: user.role };
}

async function createAuthResult(user: { id: string; email: string; role: PublicUserDto["role"] }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);
  await createSession({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    userAgent: requestMeta.userAgent,
    ip: requestMeta.ip,
    expiresAt
  });

  return { user: toPublicUser(user), sessionToken, expiresAt };
}

export async function register(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "Email is already registered.", "EMAIL_REGISTERED");
  }

  const user = await createUser({
    email: input.email,
    passwordHash: hashPassword(input.password)
  });

  return createAuthResult(user, requestMeta);
}

export async function login(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new HttpError(401, "Email or password is invalid.", "INVALID_CREDENTIALS");
  }

  return createAuthResult(user, requestMeta);
}

export async function logout(sessionId: string): Promise<void> {
  await revokeSession(sessionId);
}
