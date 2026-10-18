import type { Notebook } from "../../generated/prisma/client.js";

export type NotebookRecord = Notebook;

export type NotebookDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
