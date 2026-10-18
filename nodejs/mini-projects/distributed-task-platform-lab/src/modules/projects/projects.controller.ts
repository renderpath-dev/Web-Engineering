import type { RequestHandler } from "express";
import { createProject, getProjectById, getProjectSummary, listProjects } from "./projects.service.js";

export const list: RequestHandler = async (_request, response) => {
  response.json({ projects: await listProjects() });
};

export const create: RequestHandler = async (request, response) => {
  response.status(201).json(await createProject(request.body));
};

export const getById: RequestHandler = async (request, response) => {
  response.json(await getProjectById(String(request.params.projectId)));
};

export const summary: RequestHandler = async (request, response) => {
  response.json(await getProjectSummary(String(request.params.projectId)));
};
