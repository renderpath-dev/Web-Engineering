import { readFileSync } from "node:fs";
import { fromProjectRoot } from "../../release/artifact-hash.js";
import { evaluateReleaseGate, type GateSignal, type ReleasePhase } from "../../release/gate-model.js";
import { generateReleaseManifest } from "../../release/release-manifest.js";
import { decideRollback } from "../../release/rollback-decision.js";

export function getReleasePolicy() {
  return JSON.parse(readFileSync(fromProjectRoot("release", "release-policy.json"), "utf8")) as Record<string, unknown>;
}

export function getReleaseManifest() {
  return generateReleaseManifest();
}

export function evaluateRelease(input: { phase: ReleasePhase; signals: GateSignal[] }) {
  return evaluateReleaseGate(input);
}

export function getRollbackPlan() {
  return {
    text: readFileSync(fromProjectRoot("release", "rollback-plan.md"), "utf8")
  };
}

export function getRollbackDecision(input: { phase: ReleasePhase; signals: GateSignal[] }) {
  return decideRollback(input);
}

export function getPortfolioEvidence() {
  return {
    text: readFileSync(fromProjectRoot("release", "portfolio-evidence.md"), "utf8")
  };
}
