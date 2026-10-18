export interface ParsedProfilePayload {
  readonly displayName: string;
  readonly role: string;
}

export function parseUnknownProfilePayload(input: unknown): ParsedProfilePayload {
  if (typeof input !== "object" || input === null) {
    throw new Error("Profile payload must be an object");
  }

  const record = input as Record<string, unknown>;

  if (typeof record.displayName !== "string") {
    throw new Error("Profile displayName must be a string");
  }

  if (typeof record.role !== "string") {
    throw new Error("Profile role must be a string");
  }

  return {
    displayName: record.displayName,
    role: record.role,
  };
}
