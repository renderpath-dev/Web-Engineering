export type NavigationTimingStatus = "pass" | "warning" | "blocked";

export interface NavigationTimingSample {
  readonly navigationType: "navigate" | "reload" | "back_forward" | "prerender";
  readonly startTime: number;
  readonly domInteractive: number;
  readonly loadEventEnd: number;
}

export interface NavigationTimingReview {
  readonly navigationType: NavigationTimingSample["navigationType"];
  readonly interactiveMs: number;
  readonly completeMs: number;
  readonly status: NavigationTimingStatus;
}

export function reviewNavigationTiming(sample: NavigationTimingSample): NavigationTimingReview {
  const interactiveMs = Math.max(0, sample.domInteractive - sample.startTime);
  const completeMs = Math.max(0, sample.loadEventEnd - sample.startTime);
  const status =
    completeMs > 3000 ? "blocked" : completeMs > 1800 ? "warning" : "pass";

  return {
    navigationType: sample.navigationType,
    interactiveMs,
    completeMs,
    status,
  };
}
