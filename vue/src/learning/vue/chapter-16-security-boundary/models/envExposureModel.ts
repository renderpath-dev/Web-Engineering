export interface EnvExposureInput {
  readonly key: string;
  readonly valueClassification: "public" | "internal" | "secret";
}

export interface EnvExposureReview extends EnvExposureInput {
  readonly exposedToClient: boolean;
  readonly status: "allowed" | "blocked" | "requires-review";
  readonly reason: string;
}

export function reviewEnvExposure(input: EnvExposureInput): EnvExposureReview {
  const exposedToClient = input.key.startsWith("VITE_");

  if (exposedToClient && input.valueClassification === "secret") {
    return {
      ...input,
      exposedToClient,
      status: "blocked",
      reason: "Client-exposed env keys must not contain secrets.",
    };
  }

  if (exposedToClient && input.valueClassification === "internal") {
    return {
      ...input,
      exposedToClient,
      status: "requires-review",
      reason: "Internal values exposed through the client bundle need review.",
    };
  }

  return {
    ...input,
    exposedToClient,
    status: "allowed",
    reason: exposedToClient
      ? "Public client env value is allowed."
      : "Non-client env key is not exposed by the Vite prefix rule.",
  };
}
