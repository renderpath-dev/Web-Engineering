export interface DeprecationPlan {
  readonly propName: string;
  readonly replacement: string;
  readonly firstDeprecatedVersion: string;
  readonly plannedRemovalVersion: string;
}

export function isDeprecationPlanComplete(plan: DeprecationPlan): boolean {
  return (
    plan.propName.length > 0 &&
    plan.replacement.length > 0 &&
    plan.firstDeprecatedVersion.length > 0 &&
    plan.plannedRemovalVersion.length > 0
  );
}
