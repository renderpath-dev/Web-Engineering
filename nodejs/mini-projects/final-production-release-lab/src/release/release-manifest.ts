import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fromProjectRoot, hashFile, hashFiles, listFilesRecursively } from "./artifact-hash.js";
import { evaluateReleaseGate, type GateStatus } from "./gate-model.js";

export interface ReleaseManifest {
  releaseId: string;
  createdAt: string;
  sourceRef: string;
  packageLockHash: string;
  dockerfileHash: string;
  workflowHash: string;
  k8sManifestHash: string;
  sbomPath: string;
  sbomStatus: GateStatus;
  auditStatus: GateStatus;
  testStatus: GateStatus;
  buildStatus: GateStatus;
  smokeStatus: GateStatus;
  securityCheckStatus: GateStatus;
  releaseDecision: string;
  rollbackPlanPath: string;
  limitations: string[];
}

function fileHashOrUnknown(relativePath: string): string {
  const path = fromProjectRoot(relativePath);
  return existsSync(path) ? hashFile(path) : "UNKNOWN";
}

export function generateReleaseManifest(input: {
  auditStatus?: GateStatus;
  testStatus?: GateStatus;
  buildStatus?: GateStatus;
  smokeStatus?: GateStatus;
  securityCheckStatus?: GateStatus;
  sbomStatus?: GateStatus;
} = {}): ReleaseManifest {
  const auditStatus = input.auditStatus ?? "UNKNOWN";
  const testStatus = input.testStatus ?? "UNKNOWN";
  const buildStatus = input.buildStatus ?? "UNKNOWN";
  const smokeStatus = input.smokeStatus ?? "UNKNOWN";
  const securityCheckStatus = input.securityCheckStatus ?? "UNKNOWN";
  const sbomStatus = input.sbomStatus ?? (existsSync(fromProjectRoot("release", "sbom.cdx.json")) ? "PASS" : "UNKNOWN");
  const k8sFiles = listFilesRecursively(fromProjectRoot("k8s"));
  const evaluation = evaluateReleaseGate({
    phase: "pre-release",
    signals: [
      { name: "audit", status: auditStatus, required: true, critical: true, evidence: "npm audit --audit-level=high" },
      { name: "test", status: testStatus, required: true, critical: false, evidence: "npm test" },
      { name: "build", status: buildStatus, required: true, critical: false, evidence: "npm run build" },
      { name: "smoke", status: smokeStatus, required: true, critical: true, evidence: "npm run smoke" },
      { name: "security-check", status: securityCheckStatus, required: true, critical: true, evidence: "security validation scripts" },
      { name: "sbom", status: sbomStatus, required: true, critical: false, evidence: "npm sbom" }
    ]
  });

  return {
    releaseId: "release-local-" + new Date().toISOString().replace(/[:.]/g, "-"),
    createdAt: new Date().toISOString(),
    sourceRef: process.env.COMMIT_SHA ?? "placeholder-source-ref",
    packageLockHash: fileHashOrUnknown("package-lock.json"),
    dockerfileHash: fileHashOrUnknown("Dockerfile"),
    workflowHash: fileHashOrUnknown(join(".github", "workflows", "ci.yml")),
    k8sManifestHash: k8sFiles.length > 0 ? hashFiles(k8sFiles) : "UNKNOWN",
    sbomPath: "release/sbom.cdx.json",
    sbomStatus,
    auditStatus,
    testStatus,
    buildStatus,
    smokeStatus,
    securityCheckStatus,
    releaseDecision: evaluation.decision,
    rollbackPlanPath: "release/rollback-plan.md",
    limitations: [
      "Local evidence does not prove a real production deployment.",
      "No registry image digest is recorded by this local manifest.",
      "No GitHub Actions runtime result exists until the workflow runs in GitHub."
    ]
  };
}

export function writeReleaseManifest(path = fromProjectRoot("release", "release-manifest.generated.json")): ReleaseManifest {
  const manifest = generateReleaseManifest({
    auditStatus: "UNKNOWN",
    testStatus: "UNKNOWN",
    buildStatus: "UNKNOWN",
    smokeStatus: "UNKNOWN",
    securityCheckStatus: "UNKNOWN"
  });
  writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}
