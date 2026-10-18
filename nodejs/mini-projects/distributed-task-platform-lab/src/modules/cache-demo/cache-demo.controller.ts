import type { RequestHandler } from "express";
import { getCacheDemoSummary, invalidateCacheDemoSummary } from "./cache-demo.service.js";

export const summary: RequestHandler = async (request, response) => {
  response.json(await getCacheDemoSummary(String(request.params.projectId)));
};

export const invalidate: RequestHandler = async (request, response) => {
  response.json(await invalidateCacheDemoSummary(String(request.params.projectId)));
};
