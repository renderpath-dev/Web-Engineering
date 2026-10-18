export type PublicNoteDto = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  updatedAt: string;
};

export function acceptsOnlyPublicDto(note: PublicNoteDto): string {
  return `${note.id}:${note.title}`;
}
