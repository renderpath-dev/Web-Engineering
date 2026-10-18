export interface LegacyClickPayload {
  readonly nativeType: string;
  readonly targetId: string;
}

export interface ModernClickPayload {
  readonly eventName: "activate";
  readonly targetId: string;
}

export interface AttrForwardingDecision {
  readonly attrName: string;
  readonly targetElement: "root" | "control";
  readonly reason: string;
}

export function migrateNativeClickPayload(
  payload: LegacyClickPayload,
): ModernClickPayload {
  if (payload.nativeType !== "click") {
    throw new Error("Unsupported native event");
  }

  return {
    eventName: "activate",
    targetId: payload.targetId,
  };
}

export function chooseAttrForwardingTarget(attrName: string): AttrForwardingDecision {
  if (attrName.startsWith("aria-") || attrName.startsWith("data-")) {
    return {
      attrName,
      targetElement: "control",
      reason: "Public accessibility and test hooks belong on the interactive control.",
    };
  }

  return {
    attrName,
    targetElement: "root",
    reason: "Layout and wrapper attributes stay on the component root.",
  };
}
