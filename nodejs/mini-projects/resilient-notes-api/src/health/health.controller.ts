import type { Request, Response } from "express";
import { getLiveness, getReadiness } from "./health.service.js";

export const healthController = {
  live(_request: Request, response: Response) {
    response.json(getLiveness());
  },

  async ready(_request: Request, response: Response) {
    const readiness = await getReadiness();
    response.status(readiness.status === "not_ready" ? 503 : 200).json(readiness);
  }
};
