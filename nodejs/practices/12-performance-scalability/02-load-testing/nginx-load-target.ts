
export interface LoadTargetDecision {
  baseUrl: string;
  accepted: boolean;
  boundary: "nginx" | "api-container" | "unknown";
  message: string;
}

export function chooseLoadTarget(baseUrl = process.env.LOAD_BASE_URL ?? "http://localhost:8080"): LoadTargetDecision {
  const normalized = baseUrl.replace(/\/$/, "");

  if (normalized === "http://localhost:3020" || normalized === "http://127.0.0.1:3020") {
    return {
      baseUrl: normalized,
      accepted: false,
      boundary: "api-container",
      message: "Load tests must use the nginx entry at http://localhost:8080"
    };
  }

  return {
    baseUrl: normalized,
    accepted: normalized === "http://localhost:8080" || normalized === "http://127.0.0.1:8080",
    boundary: normalized.includes(":8080") ? "nginx" : "unknown",
    message: "The selected target should represent the production entry boundary"
  };
}
