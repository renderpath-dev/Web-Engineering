import type { RequestHandler } from "express";
import { createTask, enqueueTaskImport, listTasks } from "./tasks.service.js";

export const list: RequestHandler = async (request, response) => {
  response.json({ tasks: await listTasks(String(request.params.projectId)) });
};

export const create: RequestHandler = async (request, response) => {
  response.status(201).json(await createTask(String(request.params.projectId), request.body));
};

export const importTasks: RequestHandler = async (request, response) => {
  response.status(202).json(await enqueueTaskImport(String(request.params.projectId), request.body, request.id));
};
