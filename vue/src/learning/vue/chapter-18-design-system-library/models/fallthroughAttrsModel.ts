export type AttrForwardingTarget = "native-control" | "wrapper" | "not-forwarded";
export type AttrForwardingRisk = "safe" | "risky";

export interface AttrForwardingDecision {
  readonly componentName: string;
  readonly target: AttrForwardingTarget;
  readonly multiRoot: boolean;
  readonly forwardsListeners: boolean;
}

export function assessAttrForwarding(
  decision: AttrForwardingDecision,
): AttrForwardingRisk {
  if (decision.target !== "native-control") {
    return "risky";
  }

  if (decision.multiRoot && !decision.forwardsListeners) {
    return "risky";
  }

  return "safe";
}
