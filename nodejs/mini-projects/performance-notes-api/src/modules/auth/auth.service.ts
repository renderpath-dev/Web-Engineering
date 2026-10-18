import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { createCsrfToken, hashCsrfToken } from "../../shared/auth/csrf.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import type { AuthContext } from "../../shared/auth/auth-context.js";
import { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { AuthSessionResult, PublicUser, SessionRequestMeta } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  };
}

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async register(input: RegisterInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new HttpError(409, "EMAIL_ALREADY_REGISTERED", "Email is already registered.");

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createUser(input.email, passwordHash);
    return this.createSessionForUser(user, meta);
  }

  async login(input: LoginInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user || !await verifyPassword(input.password, user.passwordHash)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    return this.createSessionForUser(user, meta);
  }

  async me(auth: AuthContext): Promise<PublicUser> {
    const user = await this.repository.findUserById(auth.userId);
    if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User was not found.");
    return toPublicUser(user);
  }

  async rotateCsrf(auth: AuthContext): Promise<{ csrfToken: string }> {
    const csrfToken = createCsrfToken();
    await this.repository.updateCsrfToken(auth.sessionId, hashCsrfToken(csrfToken));
    return { csrfToken };
  }

  async logout(auth: AuthContext): Promise<{ loggedOut: true }> {
    await this.repository.revokeSession(auth.sessionId);
    return { loggedOut: true };
  }

  private async createSessionForUser(
    user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date },
    meta: SessionRequestMeta
  ): Promise<AuthSessionResult> {
    const sessionToken = createSessionToken();
    const csrfToken = createCsrfToken();
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);

    await this.repository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(sessionToken),
      csrfTokenHash: hashCsrfToken(csrfToken),
      userAgent: meta.userAgent,
      ipHash: meta.ip ? hashSessionToken(meta.ip) : undefined,
      expiresAt
    });

    return {
      user: toPublicUser(user),
      sessionToken,
      csrfToken,
      expiresAt
    };
  }
}
