export type CompatibilityResult = "compatible" | "potentially_compatible" | "breaking";

export function classifyChange(change: string): CompatibilityResult {
  if (change.includes("removed") || change.includes("required")) return "breaking";
  if (change.includes("enum value added") || change.includes("nullable")) return "potentially_compatible";
  return "compatible";
}
