export interface NativeElementOwnership {
  readonly componentName: string;
  readonly expectedElement: "button" | "input" | "section" | "div";
  readonly actualElement: string;
  readonly interactive: boolean;
}

export function evaluateNativeElementOwnership(
  ownership: NativeElementOwnership,
): "pass" | "fail" {
  if (ownership.interactive && ownership.expectedElement !== ownership.actualElement) {
    return "fail";
  }

  return "pass";
}
