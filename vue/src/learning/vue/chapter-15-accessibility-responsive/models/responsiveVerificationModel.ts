export type ViewportStatus = "pass" | "blocked";

export interface ViewportCheck {
  readonly width: number;
  readonly hasHorizontalOverflow: boolean;
  readonly touchTargetsPass: boolean;
  readonly navigationOperable: boolean;
}

export interface ViewportResult {
  readonly width: number;
  readonly status: ViewportStatus;
  readonly failureSignals: ReadonlyArray<string>;
}

export const representativeViewportWidths: ReadonlyArray<number> = [
  360, 390, 768, 1024, 1280, 1440,
];

export function evaluateViewport(check: ViewportCheck): ViewportResult {
  const failures: Array<string> = [];

  if (check.hasHorizontalOverflow) {
    failures.push("Horizontal overflow");
  }

  if (!check.touchTargetsPass) {
    failures.push("Touch target");
  }

  if (!check.navigationOperable) {
    failures.push("Navigation operation");
  }

  return {
    width: check.width,
    status: failures.length === 0 ? "pass" : "blocked",
    failureSignals: failures,
  };
}

export function createViewportMatrix(): ReadonlyArray<ViewportCheck> {
  return representativeViewportWidths.map((width) => ({
    width,
    hasHorizontalOverflow: false,
    touchTargetsPass: true,
    navigationOperable: true,
  }));
}

