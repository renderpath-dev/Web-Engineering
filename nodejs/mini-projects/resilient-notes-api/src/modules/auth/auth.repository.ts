import { prisma } from "../../db/prisma.js";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(email: string, passwordHash: string) {
    return prisma.user.create({ data: { email, passwordHash } });
  },

  createSession(data: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipHash?: string;
  }) {
    return prisma.session.create({ data });
  },

  revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }
};
