export interface PlaygroundControl {
  readonly name: string;
  readonly controlType: "select" | "boolean" | "text";
  readonly options: readonly string[];
  readonly allowsRawCss: boolean;
}

export function isPlaygroundControlSafe(control: PlaygroundControl): boolean {
  if (control.allowsRawCss) {
    return false;
  }

  if (control.controlType === "select") {
    return control.options.length > 0;
  }

  return true;
}
