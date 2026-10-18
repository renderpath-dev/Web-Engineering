import type { LegacyProfileLabelInput } from "../legacy-shaped/legacyFormattingFilter";

export interface ProfileLabelParts {
  readonly displayName: string;
  readonly role: string;
}

export function formatProfileLabel(input: ProfileLabelParts): string {
  return `${input.displayName.trim()} - ${input.role.trim().toUpperCase()}`;
}

export function migrateLegacyFilterInput(
  input: LegacyProfileLabelInput,
): ProfileLabelParts {
  return {
    displayName: input.displayName,
    role: input.role,
  };
}
