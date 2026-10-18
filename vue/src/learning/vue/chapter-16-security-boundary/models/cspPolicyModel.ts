export type CspMode = "report-only" | "enforce";

export interface CspPolicyConfig {
  readonly mode: CspMode;
  readonly allowImagesFromDataSource: boolean;
  readonly blockEmbedding: boolean;
}

export interface CspPolicyPreview {
  readonly mode: CspMode;
  readonly headerName: string;
  readonly directives: Readonly<Record<string, ReadonlyArray<string>>>;
  readonly serialized: string;
}

export function buildCspPolicy(config: CspPolicyConfig): CspPolicyPreview {
  const directives: Record<string, ReadonlyArray<string>> = {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "frame-ancestors": [config.blockEmbedding ? "'none'" : "'self'"],
    "img-src": config.allowImagesFromDataSource ? ["'self'", "data:"] : ["'self'"],
  };

  const serialized = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  return {
    mode: config.mode,
    headerName:
      config.mode === "report-only"
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy",
    directives,
    serialized,
  };
}
