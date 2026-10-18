export interface EscapedPreview {
  readonly rawValue: string;
  readonly renderedText: string;
  readonly sink: "text" | "attribute";
  readonly safeForHtmlExecution: false;
}

export function createEscapedPreview(
  rawValue: string,
  sink: EscapedPreview["sink"] = "text",
): EscapedPreview {
  return {
    rawValue,
    renderedText: rawValue,
    sink,
    safeForHtmlExecution: false,
  };
}

export function describeEscapedPreview(preview: EscapedPreview): string {
  return `${preview.sink} sink displays ${preview.renderedText.length} characters as text.`;
}
