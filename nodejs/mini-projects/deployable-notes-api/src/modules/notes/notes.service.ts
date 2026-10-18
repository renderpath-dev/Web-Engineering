import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "../notebooks/notebooks.repository.js";
import { NotesRepository } from "./notes.repository.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";
import type { NoteDto } from "./notes.types.js";

function toNoteDto(note: {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}): NoteDto {
  return {
    id: note.id,
    ownerId: note.ownerId,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export class NotesService {
  constructor(
    private readonly notesRepository = new NotesRepository(),
    private readonly notebooksRepository = new NotebooksRepository()
  ) {}

  async listForNotebook(ownerId: string, notebookId: string): Promise<NoteDto[]> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return (await this.notesRepository.listForNotebook(ownerId, notebookId)).map(toNoteDto);
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput): Promise<NoteDto> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNoteDto(await this.notesRepository.create(ownerId, notebookId, input));
  }

  async get(ownerId: string, noteId: string): Promise<NoteDto> {
    const note = await this.notesRepository.findOwned(ownerId, noteId);
    if (!note) throw new HttpError(404, "NOTE_NOT_FOUND", "Note was not found.");
    return toNoteDto(note);
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput): Promise<NoteDto> {
    return toNoteDto(await this.notesRepository.update(ownerId, noteId, input));
  }

  async remove(ownerId: string, noteId: string): Promise<{ deleted: true }> {
    await this.notesRepository.remove(ownerId, noteId);
    return { deleted: true };
  }
}
