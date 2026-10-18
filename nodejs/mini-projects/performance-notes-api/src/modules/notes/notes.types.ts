export type NoteStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface NoteDto {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}
