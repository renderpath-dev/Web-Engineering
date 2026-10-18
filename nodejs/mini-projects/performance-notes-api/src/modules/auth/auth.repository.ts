import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return measureQuery("User", "findUnique", () => prisma.user.findUnique({ where: { email } }));
  }

  findUserById(userId: string) {
    return measureQuery("User", "findUnique", () => prisma.user.findUnique({ where: { id: userId } }));
  }

  createUser(email: string, passwordHash: string) {
    return measureQuery("User", "create", () => prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER"
      }
    }));
  }

  createSession(input: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    userAgent?: string;
    ipHash?: string;
    expiresAt: Date;
  }) {
    return measureQuery("Session", "create", () => prisma.session.create({ data: input }));
  }

  findActiveSessionByHash(tokenHash: string, now: Date) {
    return measureQuery("Session", "findFirst", () => prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now }
      },
      include: { user: true }
    }));
  }

  updateCsrfToken(sessionId: string, csrfTokenHash: string) {
    return measureQuery("Session", "update", () => prisma.session.update({
      where: { id: sessionId },
      data: { csrfTokenHash }
    }));
  }

  revokeSession(sessionId: string) {
    return measureQuery("Session", "update", () => prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    }));
  }
}
