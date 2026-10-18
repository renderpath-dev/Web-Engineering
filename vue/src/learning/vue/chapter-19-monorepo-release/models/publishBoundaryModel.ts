import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface PublishReadiness {
  readonly packageName: string;
  readonly packageMetadataReady: boolean;
  readonly remoteAccessKnown: boolean;
  readonly secretState: "missing" | "unknown" | "verified";
  readonly ciEvidenceStatus: CiCheckStatus;
}

export const publishReadiness: PublishReadiness = {
  packageName: "@vue-lab/design-system",
  packageMetadataReady: true,
  remoteAccessKnown: false,
  secretState: "unknown",
  ciEvidenceStatus: "unknown",
};

export function isPublishBoundaryReady(readiness: PublishReadiness): boolean {
  return (
    readiness.packageMetadataReady &&
    readiness.remoteAccessKnown &&
    readiness.secretState === "verified" &&
    readiness.ciEvidenceStatus === "pass"
  );
}

export function listPublishBoundaryGaps(readiness: PublishReadiness): readonly string[] {
  const gaps: string[] = [];

  if (!readiness.packageMetadataReady) {
    gaps.push("package-metadata");
  }

  if (!readiness.remoteAccessKnown) {
    gaps.push("remote-access");
  }

  if (readiness.secretState !== "verified") {
    gaps.push("secret-state");
  }

  if (readiness.ciEvidenceStatus !== "pass") {
    gaps.push("ci-evidence");
  }

  return gaps;
}

