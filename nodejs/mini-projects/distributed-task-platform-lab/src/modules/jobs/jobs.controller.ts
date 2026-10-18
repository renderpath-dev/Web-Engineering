import type { RequestHandler } from "express";
import { getJobEvents, getJobStatus, retryJob } from "./jobs.service.js";

export const getById: RequestHandler = async (request, response) => {
  response.json(await getJobStatus(String(request.params.jobId)));
};

export const events: RequestHandler = async (request, response) => {
  response.json({ events: await getJobEvents(String(request.params.jobId)) });
};

export const retry: RequestHandler = async (request, response) => {
  response.status(202).json(await retryJob(String(request.params.jobId)));
};
