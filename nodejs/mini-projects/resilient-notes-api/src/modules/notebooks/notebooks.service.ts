import { classifyDatabaseError } from "../../db/db-error-classifier.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { notebooksRepository } from "./notebooks.repository.js";

function mapDatabaseError(error: unknown): never {
  const classification = classifyDatabaseError(error);
  if (classification.kind === "unique_conflict") throw new HttpError(409, "Notebook already exists", "CONFLICT");
  if (classification.kind === "not_found") throw new HttpError(404, "Notebook not found", "NOT_FOUND");
  throw error;
}

export const notebooksService = {
  list(ownerId: string) {
    return notebooksRepository.list(ownerId);
  },

  async find(ownerId: string, notebookId: string) {
    const notebook = await notebooksRepository.findById(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "Notebook not found", "NOT_FOUND");
    return notebook;
  },

  async create(ownerId: string, name: string) {
    try {
      return await notebooksRepository.create(ownerId, name);
    } catch (error) {
      mapDatabaseError(error);
    }
  },

  async update(ownerId: string, notebookId: string, data: { name?: string }) {
    try {
      return await notebooksRepository.update(ownerId, notebookId, data);
    } catch (error) {
      mapDatabaseError(error);
    }
  },

  async remove(ownerId: string, notebookId: string) {
    try {
      await notebooksRepository.remove(ownerId, notebookId);
    } catch (error) {
      mapDatabaseError(error);
    }
  }
};
