import type { SecurityRequestPolicy } from "./apiSecurityBoundaryModel";

export interface CsrfHeaderInput {
  readonly policy: SecurityRequestPolicy;
  readonly csrfToken: string;
}

export function createSecureRequestHeaders(
  input: CsrfHeaderInput,
): Readonly<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Requested-With": "XMLHttpRequest",
  };

  if (input.policy.requiresCsrfHeader) {
    headers["X-CSRF-Token"] = input.csrfToken;
  }

  return headers;
}

export function requiresServerCsrfValidation(policy: SecurityRequestPolicy): boolean {
  return policy.requiresCsrfHeader && policy.method !== "GET";
}
