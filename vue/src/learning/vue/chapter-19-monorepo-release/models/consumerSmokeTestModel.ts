export type ConsumerSmokeStatus = "pass" | "fail" | "unknown";

export interface ConsumerSmokeResult {
  readonly consumerPackage: string;
  readonly libraryPackage: string;
  readonly importResult: ConsumerSmokeStatus;
  readonly renderResult: ConsumerSmokeStatus;
  readonly cssResult: ConsumerSmokeStatus;
}

export const consumerSmokeResult: ConsumerSmokeResult = {
  consumerPackage: "@vue-lab/admin-app",
  libraryPackage: "@vue-lab/design-system",
  importResult: "pass",
  renderResult: "pass",
  cssResult: "unknown",
};

export function isConsumerSmokeReady(result: ConsumerSmokeResult): boolean {
  return (
    result.importResult === "pass" &&
    result.renderResult === "pass" &&
    result.cssResult === "pass"
  );
}

export function listMissingConsumerSmokeEvidence(
  result: ConsumerSmokeResult,
): readonly string[] {
  const missing: string[] = [];

  if (result.importResult !== "pass") {
    missing.push("import-result");
  }

  if (result.renderResult !== "pass") {
    missing.push("render-result");
  }

  if (result.cssResult !== "pass") {
    missing.push("css-result");
  }

  return missing;
}

