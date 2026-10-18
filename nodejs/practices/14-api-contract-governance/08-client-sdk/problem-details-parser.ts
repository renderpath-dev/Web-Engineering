export function isProblemDetails(value: unknown): value is { title: string; status: number; code: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    "status" in value &&
    "code" in value
  );
}
