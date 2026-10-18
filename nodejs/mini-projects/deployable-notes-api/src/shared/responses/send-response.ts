import type { Response } from "express";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export function sendOk<T>(response: Response, data: T): void {
  response.json({ ok: true, data } satisfies ApiSuccess<T>);
}

export function sendCreated<T>(response: Response, data: T): void {
  response.status(201).json({ ok: true, data } satisfies ApiSuccess<T>);
}
