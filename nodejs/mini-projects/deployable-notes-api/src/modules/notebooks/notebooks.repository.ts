import { prisma } from "../../db/prisma.js";

export class NotebooksRepository {
  list(ownerId: string) {
    return prisma.notebook.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" }
    });
  }

  findOwned(ownerId: string, notebookId: string) {
    return prisma.notebook.findFirst({
      where: { id: notebookId, ownerId }
    });
  }

  create(ownerId: string, name: string) {
    return prisma.notebook.create({
      data: { ownerId, name }
    });
  }

  update(ownerId: string, notebookId: string, name: string) {
    return prisma.notebook.update({
      where: { id: notebookId, ownerId },
      data: { name }
    });
  }

  remove(ownerId: string, notebookId: string) {
    return prisma.notebook.delete({
      where: { id: notebookId, ownerId }
    });
  }
}
