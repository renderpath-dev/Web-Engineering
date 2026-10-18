import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "./notebooks.repository.js";
import type { CreateNotebookInput, UpdateNotebookInput } from "./notebooks.schema.js";
import type { NotebookDto } from "./notebooks.types.js";

function toNotebookDto(notebook: { id: string; ownerId: string; name: string; createdAt: Date; updatedAt: Date }): NotebookDto {
  return {
    id: notebook.id,
    ownerId: notebook.ownerId,
    name: notebook.name,
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString()
  };
}

export class NotebooksService {
  constructor(private readonly repository = new NotebooksRepository()) {}

  async list(ownerId: string): Promise<NotebookDto[]> {
    return (await this.repository.list(ownerId)).map(toNotebookDto);
  }

  async get(ownerId: string, notebookId: string): Promise<NotebookDto> {
    const notebook = await this.repository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNotebookDto(notebook);
  }

  async create(ownerId: string, input: CreateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.create(ownerId, input.name));
  }

  async update(ownerId: string, notebookId: string, input: UpdateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.update(ownerId, notebookId, input.name));
  }

  async remove(ownerId: string, notebookId: string): Promise<{ deleted: true }> {
    await this.repository.remove(ownerId, notebookId);
    return { deleted: true };
  }
}
