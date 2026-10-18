export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string,
    readonly details?: unknown,
    readonly retryable = false,
    readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "HttpError";
  }
}
