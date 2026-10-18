export type ComponentStateName =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "loading"
  | "error"
  | "selected"
  | "empty";

export interface ComponentStateCoverage {
  readonly componentName: string;
  readonly states: readonly ComponentStateName[];
}

export const requiredComponentStates: readonly ComponentStateName[] = [
  "default",
  "hover",
  "focus",
  "disabled",
  "loading",
  "error",
  "selected",
  "empty",
];

export function findMissingComponentStates(
  coverage: ComponentStateCoverage,
  requiredStates: readonly ComponentStateName[] = requiredComponentStates,
): readonly ComponentStateName[] {
  const covered = new Set(coverage.states);

  return requiredStates.filter((state) => !covered.has(state));
}
