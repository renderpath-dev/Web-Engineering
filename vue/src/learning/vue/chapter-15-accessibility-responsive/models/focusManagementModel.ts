export interface FocusTarget {
  readonly id: string;
  readonly label: string;
  readonly reason: string;
}

export interface RouteFocusPlan {
  readonly fromRoute: string;
  readonly toRoute: string;
  readonly target: FocusTarget;
}

export const routeFocusPlans: ReadonlyArray<RouteFocusPlan> = [
  {
    fromRoute: "/admin/users",
    toRoute: "/admin/orders",
    target: {
      id: "chapter-15-main",
      label: "Chapter 15 main content",
      reason: "Route change should expose the new page start before inner controls.",
    },
  },
];

export function createFocusRestoreMessage(plan: RouteFocusPlan): string {
  return `${plan.toRoute} moves focus to ${plan.target.id}`;
}

export function isFocusableTarget(target: FocusTarget): boolean {
  return target.id.length > 0 && target.label.length > 0;
}

