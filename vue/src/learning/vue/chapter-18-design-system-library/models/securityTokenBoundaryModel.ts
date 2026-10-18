export type CustomizationInputKind = "token" | "slot" | "raw-css" | "raw-html";

export interface CustomizationInput {
  readonly kind: CustomizationInputKind;
  readonly value: string;
}

export function isCustomizationSafe(input: CustomizationInput): boolean {
  return input.kind === "token" || input.kind === "slot";
}

export function findUnsafeCustomizationInputs(
  inputs: readonly CustomizationInput[],
): readonly CustomizationInput[] {
  return inputs.filter((input) => !isCustomizationSafe(input));
}
