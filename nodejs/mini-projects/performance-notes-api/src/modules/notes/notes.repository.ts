import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";

export class NotesRepository {
  async listForNotebook(ownerId: string, notebookId: string) {
    return measureQuery("Note", "findMany", () => prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    }));
  }

  async findOwned(ownerId: string, noteId: string) {
    return measureQuery("Note", "findFirst", () => prisma.note.findFirst({
      where: { id: noteId, ownerId }
    }));
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput) {
    return measureQuery("Note", "create", () => prisma.note.create({
      data: {
        ownerId,
        notebookId,
        title: input.title,
        body: input.body,
        status: input.status
      }
    }));
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput) {
    return measureQuery("Note", "update", () => prisma.note.update({
      where: { id: noteId, ownerId },
      data: input
    }));
  }

  async remove(ownerId: string, noteId: string) {
    return measureQuery("Note", "delete", () => prisma.note.delete({
      where: { id: noteId, ownerId }
    }));
  }
}
