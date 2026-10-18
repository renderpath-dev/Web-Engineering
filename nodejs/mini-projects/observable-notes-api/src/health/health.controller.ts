import type { RequestHandler } from "express";
import { sendSuccess } from "../shared/responses/send-response.js";
import * as service from "./health.service.js";

export const live: RequestHandler = (_request, response) => {
  sendSuccess(response, 200, service.getLiveHealth());
};

export const ready: RequestHandler = async (_request, response, next) => {
  try {
    const health = await service.getReadyHealth();
    sendSuccess(response, health.status === "ready" ? 200 : 503, health);
  } catch (error) {
    next(error);
  }
};
