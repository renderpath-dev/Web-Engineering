export type DataClassification = "public" | "internal" | "personal" | "secret";
export type DataSink = "url" | "log" | "local-storage" | "analytics" | "error-report" | "screen";
export type PrivacyReviewStatus = "allowed" | "blocked" | "requires-review";

export interface PrivacyReviewInput {
  readonly label: string;
  readonly classification: DataClassification;
  readonly sink: DataSink;
}

export interface PrivacyReviewResult extends PrivacyReviewInput {
  readonly status: PrivacyReviewStatus;
  readonly reason: string;
}

export function reviewPrivacySink(input: PrivacyReviewInput): PrivacyReviewResult {
  if (input.classification === "secret") {
    return {
      ...input,
      status: "blocked",
      reason: "Secrets must not enter client-visible sinks.",
    };
  }

  if (input.classification === "personal" && input.sink !== "screen") {
    return {
      ...input,
      status: "blocked",
      reason: "Personal data needs minimization before URL, storage, log, analytics, or error sinks.",
    };
  }

  if (input.classification === "internal" && input.sink !== "screen") {
    return {
      ...input,
      status: "requires-review",
      reason: "Internal data needs product and privacy review outside screen display.",
    };
  }

  return {
    ...input,
    status: "allowed",
    reason: "Public data can enter this sink in the learning model.",
  };
}
