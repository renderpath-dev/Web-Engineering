import type { Response } from "express";

export function sendResponse<T>(response: Response, statusCode: number, body: T): void {
  response.status(statusCode).json(body);
}
