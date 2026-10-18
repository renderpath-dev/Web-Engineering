export interface SecurityRequestPolicy {
  readonly endpoint: string;
  readonly method: "GET" | "POST" | "PUT" | "DELETE";
  readonly credentialsMode: "same-origin" | "include" | "omit";
  readonly requiresCsrfHeader: boolean;
  readonly requiresBackendAuthorization: boolean;
}

export const apiSecurityPolicies: ReadonlyArray<SecurityRequestPolicy> = [
  {
    endpoint: "/api/profile",
    method: "GET",
    credentialsMode: "same-origin",
    requiresCsrfHeader: false,
    requiresBackendAuthorization: true,
  },
  {
    endpoint: "/api/settings",
    method: "POST",
    credentialsMode: "same-origin",
    requiresCsrfHeader: true,
    requiresBackendAuthorization: true,
  },
];

export function describeApiSecurityBoundary(policy: SecurityRequestPolicy): string {
  return `${policy.method} ${policy.endpoint} requires backend authorization: ${policy.requiresBackendAuthorization}.`;
}
