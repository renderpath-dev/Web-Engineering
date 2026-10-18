import type { Response } from "express";

export function sendJson<T>(response: Response, status: number, body: T): void {
  response.status(status).json(body);
}

export function sendNoContent(response: Response): void {
  response.status(204).end();
}
