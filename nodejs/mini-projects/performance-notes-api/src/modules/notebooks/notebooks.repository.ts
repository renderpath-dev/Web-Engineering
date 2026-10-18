import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";

export class NotebooksRepository {
  list(ownerId: string) {
    return measureQuery("Notebook", "findMany", () => prisma.notebook.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" }
    }));
  }

  findOwned(ownerId: string, notebookId: string) {
    return measureQuery("Notebook", "findFirst", () => prisma.notebook.findFirst({
      where: { id: notebookId, ownerId }
    }));
  }

  create(ownerId: string, name: string) {
    return measureQuery("Notebook", "create", () => prisma.notebook.create({
      data: { ownerId, name }
    }));
  }

  update(ownerId: string, notebookId: string, name: string) {
    return measureQuery("Notebook", "update", () => prisma.notebook.update({
      where: { id: notebookId, ownerId },
      data: { name }
    }));
  }

  remove(ownerId: string, notebookId: string) {
    return measureQuery("Notebook", "delete", () => prisma.notebook.delete({
      where: { id: notebookId, ownerId }
    }));
  }
}
