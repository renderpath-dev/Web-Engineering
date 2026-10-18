import { prisma } from "../../db/prisma.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  createUser(email: string, passwordHash: string) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER"
      }
    });
  }

  createSession(input: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    userAgent?: string;
    ipHash?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data: input });
  }

  findActiveSessionByHash(tokenHash: string, now: Date) {
    return prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now }
      },
      include: { user: true }
    });
  }

  updateCsrfToken(sessionId: string, csrfTokenHash: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { csrfTokenHash }
    });
  }

  revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }
}
