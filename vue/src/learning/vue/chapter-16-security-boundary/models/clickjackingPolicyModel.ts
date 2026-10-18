export interface ClickjackingPolicy {
  readonly id: string;
  readonly frameAncestors: "'none'" | "'self'";
  readonly legacyHeader: "DENY" | "SAMEORIGIN";
  readonly evidence: string;
}

export const clickjackingPolicies: ReadonlyArray<ClickjackingPolicy> = [
  {
    id: "deny-embedding",
    frameAncestors: "'none'",
    legacyHeader: "DENY",
    evidence: "Use when the application should not be embedded by another page.",
  },
  {
    id: "same-origin-embedding",
    frameAncestors: "'self'",
    legacyHeader: "SAMEORIGIN",
    evidence: "Use only after reviewing same-origin embedding requirements.",
  },
];

export function getStrictClickjackingPolicy(): ClickjackingPolicy {
  return clickjackingPolicies[0];
}
