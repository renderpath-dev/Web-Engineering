import type { Note, NoteStatus } from "../../generated/prisma/client.js";

export type NoteRecord = Note;
export type { NoteStatus };

export type NoteDto = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
};
