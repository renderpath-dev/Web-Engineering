import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface ProvenanceBoundary {
  readonly packageName: string;
  readonly supportedCiProvider: boolean;
  readonly claimStatus: CiCheckStatus;
  readonly publicBuildLinkKnown: boolean;
}

export const provenanceBoundary: ProvenanceBoundary = {
  packageName: "@vue-lab/design-system",
  supportedCiProvider: false,
  claimStatus: "unknown",
  publicBuildLinkKnown: false,
};

export function isProvenanceVerified(boundary: ProvenanceBoundary): boolean {
  return (
    boundary.supportedCiProvider &&
    boundary.claimStatus === "pass" &&
    boundary.publicBuildLinkKnown
  );
}

