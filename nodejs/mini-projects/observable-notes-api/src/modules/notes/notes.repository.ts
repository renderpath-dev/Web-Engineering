import { prisma } from "../../db/prisma.js";
import type { NoteDto, NoteRecord, NoteStatus } from "./notes.types.js";

export function toNoteDto(note: NoteRecord): NoteDto {
  return {
    id: note.id,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export async function listNotes(input: {
  ownerId: string;
  notebookId: string;
  status?: NoteStatus;
  limit: number;
  offset: number;
}): Promise<NoteRecord[]> {
  return prisma.note.findMany({
    where: {
      ownerId: input.ownerId,
      notebookId: input.notebookId,
      status: input.status
    },
    orderBy: { createdAt: "desc" },
    take: input.limit,
    skip: input.offset
  });
}

export async function findNoteById(id: string): Promise<NoteRecord | null> {
  return prisma.note.findUnique({ where: { id } });
}

export async function createNote(input: {
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
}): Promise<NoteRecord> {
  return prisma.note.create({ data: input });
}

export async function updateNote(id: string, input: Partial<Pick<NoteRecord, "title" | "body" | "status">>): Promise<NoteRecord> {
  return prisma.note.update({
    where: { id },
    data: input
  });
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
}
