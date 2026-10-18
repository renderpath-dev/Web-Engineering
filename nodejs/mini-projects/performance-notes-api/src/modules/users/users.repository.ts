import { prisma } from "../../db/prisma.js";

export class UsersRepository {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });
  }
}
