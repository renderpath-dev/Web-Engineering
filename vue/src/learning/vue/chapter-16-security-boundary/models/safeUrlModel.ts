export type UrlReviewStatus = "allowed" | "blocked" | "requires-backend-review";

export interface UrlReviewResult {
  readonly input: string;
  readonly normalizedUrl: string;
  readonly status: UrlReviewStatus;
  readonly reason: string;
}

const defaultBaseUrl = "https://app.example";
const allowedProtocols = new Set(["https:"]);

export function reviewUrlValue(
  input: string,
  baseUrl = defaultBaseUrl,
): UrlReviewResult {
  try {
    const parsed = new URL(input, baseUrl);
    const base = new URL(baseUrl);
    const isSameOriginRelative = !input.includes("://") && parsed.origin === base.origin;

    if (isSameOriginRelative) {
      return {
        input,
        normalizedUrl: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        status: "allowed",
        reason: "Same-origin relative URL is allowed by the learning model.",
      };
    }

    if (!allowedProtocols.has(parsed.protocol)) {
      return {
        input,
        normalizedUrl: parsed.href,
        status: "blocked",
        reason: "Protocol is outside the allowlist.",
      };
    }

    return {
      input,
      normalizedUrl: parsed.href,
      status: "requires-backend-review",
      reason: "External URL must be reviewed before persistence or API return.",
    };
  } catch {
    return {
      input,
      normalizedUrl: "",
      status: "blocked",
      reason: "URL parsing failed.",
    };
  }
}
