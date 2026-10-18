export type AuthStorageKind =
  | "http-only-cookie"
  | "memory-state"
  | "session-storage"
  | "local-storage";

export interface AuthStorageOption {
  readonly kind: AuthStorageKind;
  readonly persistence: "none" | "tab" | "browser";
  readonly readableByJavaScript: boolean;
  readonly riskScore: number;
  readonly coordination: string;
}

export const authStorageOptions: ReadonlyArray<AuthStorageOption> = [
  {
    kind: "http-only-cookie",
    persistence: "browser",
    readableByJavaScript: false,
    riskScore: 2,
    coordination: "Requires backend cookie flags and session validation.",
  },
  {
    kind: "memory-state",
    persistence: "none",
    readableByJavaScript: true,
    riskScore: 3,
    coordination: "Requires reload and refresh-token strategy review.",
  },
  {
    kind: "session-storage",
    persistence: "tab",
    readableByJavaScript: true,
    riskScore: 6,
    coordination: "Requires XSS impact review.",
  },
  {
    kind: "local-storage",
    persistence: "browser",
    readableByJavaScript: true,
    riskScore: 9,
    coordination: "Requires explicit XSS and privacy risk acceptance.",
  },
];

export function rankAuthStorageRisk(
  options: ReadonlyArray<AuthStorageOption> = authStorageOptions,
): ReadonlyArray<AuthStorageOption> {
  return [...options].sort((left, right) => left.riskScore - right.riskScore);
}
