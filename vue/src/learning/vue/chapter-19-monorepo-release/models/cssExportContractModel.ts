export type CssEvidenceStatus = "pass" | "fail" | "unknown";

export interface CssExportContract {
  readonly packageName: string;
  readonly cssEntry: string;
  readonly assetPaths: readonly string[];
  readonly sideEffectSafe: boolean;
  readonly consumerEvidenceStatus: CssEvidenceStatus;
}

export const cssExportContract: CssExportContract = {
  packageName: "@vue-lab/design-system",
  cssEntry: "./css",
  assetPaths: ["dist/assets/button-focus.css"],
  sideEffectSafe: true,
  consumerEvidenceStatus: "pass",
};

export function isCssExportReady(contract: CssExportContract): boolean {
  return (
    contract.cssEntry.length > 0 &&
    contract.sideEffectSafe &&
    contract.consumerEvidenceStatus === "pass"
  );
}

export function listCssContractFailures(contract: CssExportContract): readonly string[] {
  const failures: string[] = [];

  if (contract.cssEntry.length === 0) {
    failures.push("missing-css-entry");
  }

  if (!contract.sideEffectSafe) {
    failures.push("unsafe-side-effect");
  }

  if (contract.consumerEvidenceStatus !== "pass") {
    failures.push("missing-consumer-style-evidence");
  }

  return failures;
}

