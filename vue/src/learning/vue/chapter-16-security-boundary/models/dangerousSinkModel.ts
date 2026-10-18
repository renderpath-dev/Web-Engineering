export type DangerousSinkKind =
  | "html-rendering"
  | "script-string"
  | "function-constructor"
  | "string-timer"
  | "inline-event-attribute"
  | "dynamic-script-node";

export interface DangerousSinkReview {
  readonly id: string;
  readonly kind: DangerousSinkKind;
  readonly label: string;
  readonly risk: "critical" | "high";
  readonly reviewAction: string;
}

export const dangerousSinkReviews: ReadonlyArray<DangerousSinkReview> = [
  {
    id: "html-rendering-directive",
    kind: "html-rendering",
    label: "HTML rendering escape hatch",
    risk: "high",
    reviewAction: "Keep untrusted content out of HTML rendering sinks.",
  },
  {
    id: "string-code-runner",
    kind: "script-string",
    label: "String code runner",
    risk: "critical",
    reviewAction: "Block string-based code execution in application source.",
  },
  {
    id: "function-constructor",
    kind: "function-constructor",
    label: "Dynamic function constructor",
    risk: "critical",
    reviewAction: "Use trusted functions instead of runtime code construction.",
  },
  {
    id: "string-timer",
    kind: "string-timer",
    label: "String timer callback",
    risk: "high",
    reviewAction: "Pass a function reference to timers.",
  },
  {
    id: "inline-event",
    kind: "inline-event-attribute",
    label: "Inline event attribute",
    risk: "high",
    reviewAction: "Use trusted Vue event bindings instead of user-provided handler text.",
  },
];

export function isDangerousSink(kind: DangerousSinkKind): boolean {
  return dangerousSinkReviews.some((sink) => sink.kind === kind);
}

export function getSinkReviewAction(kind: DangerousSinkKind): string {
  return (
    dangerousSinkReviews.find((sink) => sink.kind === kind)?.reviewAction ??
    "Escalate unknown sink for security review."
  );
}
