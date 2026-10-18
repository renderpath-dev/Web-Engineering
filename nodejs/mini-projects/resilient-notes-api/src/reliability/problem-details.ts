export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
  validationErrors?: unknown;
}

export interface ProblemDetailsInput {
  status: number;
  title: string;
  detail: string;
  instance: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
  validationErrors?: unknown;
}

export function buildProblemDetails(input: ProblemDetailsInput): ProblemDetails {
  return {
    type: `https://example.com/problems/${input.code.toLowerCase().replaceAll("_", "-")}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    retryable: input.retryable,
    retryAfterSeconds: input.retryAfterSeconds,
    requestId: input.requestId,
    validationErrors: input.validationErrors
  };
}
