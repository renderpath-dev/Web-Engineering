export type WebVitalName = "LCP" | "CLS" | "INP";
export type WebVitalStatus = "pass" | "warning" | "blocked";

export interface WebVitalBudget {
  readonly name: WebVitalName;
  readonly warningThreshold: number;
  readonly blockedThreshold: number;
}

export interface WebVitalReview {
  readonly name: WebVitalName;
  readonly value: number;
  readonly status: WebVitalStatus;
  readonly fieldData: boolean;
}

export const webVitalBudgets: ReadonlyArray<WebVitalBudget> = [
  { name: "LCP", warningThreshold: 2500, blockedThreshold: 4000 },
  { name: "CLS", warningThreshold: 0.1, blockedThreshold: 0.25 },
  { name: "INP", warningThreshold: 200, blockedThreshold: 500 },
];

export function reviewWebVital(
  name: WebVitalName,
  value: number,
  fieldData = false,
): WebVitalReview {
  const budget = webVitalBudgets.find((item) => item.name === name) ?? webVitalBudgets[0];
  const status =
    value >= budget.blockedThreshold
      ? "blocked"
      : value >= budget.warningThreshold
        ? "warning"
        : "pass";

  return {
    name,
    value,
    status,
    fieldData,
  };
}
