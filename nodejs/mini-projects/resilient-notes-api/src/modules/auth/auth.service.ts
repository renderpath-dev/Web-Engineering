import { randomBytes } from "node:crypto";
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashToken } from "../../shared/auth/session-token.js";
import { authRepository } from "./auth.repository.js";
import type { AuthSessionResult } from "./auth.types.js";

function toAuthUser(user: { id: string; email: string; role: "USER" | "ADMIN" }) {
  return { id: user.id, email: user.email, role: user.role };
}

export const authService = {
  async register(email: string, password: string): Promise<AuthSessionResult> {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) throw new HttpError(409, "Email is already registered", "CONFLICT");
    const user = await authRepository.createUser(email, await hashPassword(password));
    return this.createSessionForUser(user);
  },

  async login(email: string, password: string): Promise<AuthSessionResult> {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid credentials", "AUTHENTICATION_REQUIRED");
    }
    return this.createSessionForUser(user);
  },

  async logout(sessionId: string): Promise<void> {
    await authRepository.revokeSession(sessionId);
  },

  async createSessionForUser(user: { id: string; email: string; role: "USER" | "ADMIN" }): Promise<AuthSessionResult> {
    const sessionToken = createSessionToken();
    const csrfToken = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1_000);
    await authRepository.createSession({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      csrfTokenHash: hashToken(csrfToken),
      expiresAt
    });
    return { user: toAuthUser(user), sessionToken, csrfToken, expiresAt };
  }
};
