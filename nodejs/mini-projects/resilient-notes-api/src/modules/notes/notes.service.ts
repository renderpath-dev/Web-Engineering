import { classifyDatabaseError } from "../../db/db-error-classifier.js";
import { withTransactionRetry } from "../../db/transaction-retry.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { notesRepository } from "./notes.repository.js";

function mapNoteError(error: unknown): never {
  const classification = classifyDatabaseError(error);
  if (classification.kind === "unique_conflict") throw new HttpError(409, "Note title already exists", "CONFLICT");
  if (classification.kind === "not_found") throw new HttpError(404, "Note not found", "NOT_FOUND");
  throw error;
}

export const notesService = {
  listForNotebook(ownerId: string, notebookId: string) {
    return notesRepository.listForNotebook(ownerId, notebookId);
  },

  async find(ownerId: string, noteId: string) {
    const note = await notesRepository.findById(ownerId, noteId);
    if (!note) throw new HttpError(404, "Note not found", "NOT_FOUND");
    return note;
  },

  async create(ownerId: string, notebookId: string, data: { title: string; body: string }) {
    try {
      return await withTransactionRetry(async (transaction) => {
        const notebook = await transaction.notebook.findFirst({ where: { id: notebookId, ownerId } });
        if (!notebook) throw new HttpError(404, "Notebook not found", "NOT_FOUND");
        return transaction.note.create({ data: { ownerId, notebookId, title: data.title, body: data.body } });
      });
    } catch (error) {
      mapNoteError(error);
    }
  },

  async update(ownerId: string, noteId: string, data: { title?: string; body?: string; status?: "DRAFT" | "ACTIVE" | "ARCHIVED" }) {
    try {
      return await notesRepository.update(ownerId, noteId, data);
    } catch (error) {
      mapNoteError(error);
    }
  },

  async remove(ownerId: string, noteId: string) {
    try {
      await notesRepository.remove(ownerId, noteId);
    } catch (error) {
      mapNoteError(error);
    }
  }
};
