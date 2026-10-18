export type ControlElementKind = "button" | "link" | "custom";
export type KeyboardKey = "Enter" | " " | "ArrowLeft" | "ArrowRight" | "Escape" | "Tab";

export interface ControlInteractionRule {
  readonly kind: ControlElementKind;
  readonly nativeRole: string;
  readonly activationKeys: ReadonlyArray<KeyboardKey>;
  readonly preferredElement: string;
  readonly requiresManualKeyboardImplementation: boolean;
  readonly failureSignal: string;
}

export interface NativeControlReviewItem {
  readonly id: string;
  readonly kind: ControlElementKind;
  readonly label: string;
  readonly preferred: boolean;
  readonly evidence: string;
}

export const controlInteractionRules: ReadonlyArray<ControlInteractionRule> = [
  {
    kind: "button",
    nativeRole: "button",
    activationKeys: ["Enter", " "],
    preferredElement: "button",
    requiresManualKeyboardImplementation: false,
    failureSignal: "Use a native button before rebuilding keyboard activation.",
  },
  {
    kind: "link",
    nativeRole: "link",
    activationKeys: ["Enter"],
    preferredElement: "a[href]",
    requiresManualKeyboardImplementation: false,
    failureSignal: "Use a link for navigation with a real href.",
  },
  {
    kind: "custom",
    nativeRole: "none",
    activationKeys: ["Enter", " "],
    preferredElement: "button",
    requiresManualKeyboardImplementation: true,
    failureSignal: "Custom controls need role, state, focus, and keyboard behavior.",
  },
];

export const nativeControlReviewItems: ReadonlyArray<NativeControlReviewItem> = [
  {
    id: "native-button",
    kind: "button",
    label: "Native button action",
    preferred: true,
    evidence: "Enter and Space activation are platform-owned.",
  },
  {
    id: "native-link",
    kind: "link",
    label: "Native link navigation",
    preferred: true,
    evidence: "Enter activation and URL ownership come from a real href.",
  },
  {
    id: "custom-risk",
    kind: "custom",
    label: "Custom control risk",
    preferred: false,
    evidence: "A role does not create focus, key handling, or disabled behavior.",
  },
];

export function getActivationRule(kind: ControlElementKind): ControlInteractionRule {
  const rule = controlInteractionRules.find((item) => item.kind === kind);

  if (!rule) {
    throw new Error("Unknown control kind");
  }

  return rule;
}

export function keyActivatesControl(kind: ControlElementKind, key: KeyboardKey): boolean {
  return getActivationRule(kind).activationKeys.includes(key);
}

export function shouldPreferNativeControl(kind: ControlElementKind): boolean {
  return !getActivationRule(kind).requiresManualKeyboardImplementation;
}
