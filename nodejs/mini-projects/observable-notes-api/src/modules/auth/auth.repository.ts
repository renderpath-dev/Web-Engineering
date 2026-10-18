import { createHash } from "node:crypto";
import { prisma } from "../../db/prisma.js";
import { Role } from "../../generated/prisma/client.js";

export async function createUser(input: { email: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      role: Role.USER
    }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createSession(input: { userId: string; tokenHash: string; userAgent?: string; ip?: string; expiresAt: Date }) {
  return prisma.session.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgent: input.userAgent,
      ipHash: input.ip ? createHash("sha256").update(input.ip).digest("base64url") : undefined,
      expiresAt: input.expiresAt
    }
  });
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
}
