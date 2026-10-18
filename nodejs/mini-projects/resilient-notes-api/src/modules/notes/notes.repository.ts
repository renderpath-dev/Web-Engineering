import { prisma } from "../../db/prisma.js";

export const notesRepository = {
  listForNotebook(ownerId: string, notebookId: string) {
    return prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    });
  },

  findById(ownerId: string, noteId: string) {
    return prisma.note.findFirst({ where: { id: noteId, ownerId } });
  },

  create(ownerId: string, notebookId: string, data: { title: string; body: string }) {
    return prisma.note.create({ data: { ownerId, notebookId, title: data.title, body: data.body } });
  },

  update(ownerId: string, noteId: string, data: { title?: string; body?: string; status?: "DRAFT" | "ACTIVE" | "ARCHIVED" }) {
    return prisma.note.update({ where: { id: noteId, ownerId }, data });
  },

  remove(ownerId: string, noteId: string) {
    return prisma.note.delete({ where: { id: noteId, ownerId } });
  }
};
