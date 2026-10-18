export const errorStatusByCode = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TIMEOUT: 504,
  DEPENDENCY_UNAVAILABLE: 503,
  RATE_LIMITED: 429
} as const;

export type ErrorCode = keyof typeof errorStatusByCode | "INTERNAL_ERROR";

export interface ErrorMapping {
  status: number;
  retryable: boolean;
  title: string;
}

export function mapErrorCode(code: ErrorCode): ErrorMapping {
  switch (code) {
    case "VALIDATION_ERROR":
      return { status: 400, retryable: false, title: "Validation failed" };
    case "AUTHENTICATION_REQUIRED":
      return { status: 401, retryable: false, title: "Authentication required" };
    case "FORBIDDEN":
      return { status: 403, retryable: false, title: "Forbidden" };
    case "NOT_FOUND":
      return { status: 404, retryable: false, title: "Not found" };
    case "CONFLICT":
      return { status: 409, retryable: false, title: "Conflict" };
    case "TIMEOUT":
      return { status: 504, retryable: true, title: "Dependency timeout" };
    case "DEPENDENCY_UNAVAILABLE":
      return { status: 503, retryable: true, title: "Dependency unavailable" };
    case "RATE_LIMITED":
      return { status: 429, retryable: true, title: "Rate limited" };
    case "INTERNAL_ERROR":
      return { status: 500, retryable: false, title: "Internal server error" };
  }
}
