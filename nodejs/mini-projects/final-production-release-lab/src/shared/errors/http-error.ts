export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly expose: boolean;
  public readonly details?: unknown;

  public constructor(statusCode: number, code: string, message: string, options: { expose?: boolean; details?: unknown } = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.expose = options.expose ?? statusCode < 500;
    this.details = options.details;
  }
}
