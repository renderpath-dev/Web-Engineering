import type { NextFunction, Request, Response } from "express";
import { getLiveness, getReadiness } from "./health.service.js";
import { sendOk } from "../shared/responses/send-response.js";

export async function live(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, getLiveness());
  } catch (error) {
    next(error);
  }
}

export async function ready(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const readiness = await getReadiness();
    const statusCode = readiness.status === "ready" ? 200 : 503;
    sendOk(response.status(statusCode), readiness);
  } catch (error) {
    next(error);
  }
}
