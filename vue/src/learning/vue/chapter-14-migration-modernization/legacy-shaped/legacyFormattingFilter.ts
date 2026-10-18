export interface LegacyProfileLabelInput {
  readonly displayName: string;
  readonly role: string;
}

export function legacyProfileLabelFilter(
  input: LegacyProfileLabelInput,
): string {
  return `${input.displayName.trim()} - ${input.role.trim().toUpperCase()}`;
}
