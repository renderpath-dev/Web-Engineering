import { prisma } from "../../db/prisma.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";

export class NotesRepository {
  async listForNotebook(ownerId: string, notebookId: string) {
    return prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    });
  }

  async findOwned(ownerId: string, noteId: string) {
    return prisma.note.findFirst({
      where: { id: noteId, ownerId }
    });
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput) {
    return prisma.note.create({
      data: {
        ownerId,
        notebookId,
        title: input.title,
        body: input.body,
        status: input.status
      }
    });
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput) {
    return prisma.note.update({
      where: { id: noteId, ownerId },
      data: input
    });
  }

  async remove(ownerId: string, noteId: string) {
    return prisma.note.delete({
      where: { id: noteId, ownerId }
    });
  }
}
