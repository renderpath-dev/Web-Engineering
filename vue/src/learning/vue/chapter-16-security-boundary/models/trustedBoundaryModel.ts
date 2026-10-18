export type TrustLevel = "trusted-code" | "untrusted-data" | "server-policy";

export interface TrustedBoundaryItem {
  readonly id: string;
  readonly label: string;
  readonly trustLevel: TrustLevel;
  readonly allowedSink: string;
  readonly blockedSink: string;
  readonly evidence: string;
}

export const trustedBoundaryItems: ReadonlyArray<TrustedBoundaryItem> = [
  {
    id: "template-source",
    label: "Vue template source",
    trustLevel: "trusted-code",
    allowedSink: "compiled component template",
    blockedSink: "runtime user template compilation",
    evidence: "Templates are application code and can execute expressions.",
  },
  {
    id: "api-display-name",
    label: "API display name",
    trustLevel: "untrusted-data",
    allowedSink: "text interpolation",
    blockedSink: "HTML execution sink",
    evidence: "Data can be displayed as text without becoming code.",
  },
  {
    id: "response-header-policy",
    label: "Security response policy",
    trustLevel: "server-policy",
    allowedSink: "HTTP response header",
    blockedSink: "client-only claim",
    evidence: "The browser can enforce CSP only when a response provides it.",
  },
];

export function canEnterTemplateCompiler(item: TrustedBoundaryItem): boolean {
  return item.trustLevel === "trusted-code";
}

export function getBoundaryFailureSignal(item: TrustedBoundaryItem): string {
  return canEnterTemplateCompiler(item)
    ? "Template remains trusted application source."
    : "Untrusted value must stay out of the template compiler.";
}
