import type { ProblemDetails } from "./api-client.types.js";

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "title" in value &&
    "status" in value &&
    "code" in value
  );
}

export async function parseProblemResponse(response: Response): Promise<ProblemDetails> {
  const parsed = (await response.json().catch(() => undefined)) as unknown;
  if (isProblemDetails(parsed)) return parsed;
  return {
    type: "https://api.example.test/problems/unparseable_problem",
    title: "Unparseable problem",
    status: response.status,
    detail: "The response did not match Problem Details.",
    code: "unparseable_problem"
  };
}
