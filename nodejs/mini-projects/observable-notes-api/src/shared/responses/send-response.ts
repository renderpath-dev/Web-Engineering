import type { Response } from "express";

export function sendSuccess(response: Response, status: number, data: unknown): void {
  response.status(status).json({ ok: true, data });
}
