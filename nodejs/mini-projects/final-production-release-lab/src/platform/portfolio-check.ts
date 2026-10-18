import { existsSync, readFileSync } from "node:fs";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface PortfolioCheckResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

export function evaluatePortfolioEvidence(): PortfolioCheckResult {
  const issues: string[] = [];
  const evidencePath = fromProjectRoot("release", "portfolio-evidence.md");
  const readmePath = fromProjectRoot("README.md");

  if (!existsSync(evidencePath)) issues.push("portfolio evidence file is missing");
  if (!existsSync(readmePath)) issues.push("README.md is missing");

  if (existsSync(evidencePath)) {
    const evidence = readFileSync(evidencePath, "utf8");
    for (const requiredPhrase of ["local production-release readiness lab", "not be described as a real production deployment", "npm run workflow:check"]) {
      if (!evidence.includes(requiredPhrase)) {
        issues.push("portfolio evidence is missing: " + requiredPhrase);
      }
    }
  }

  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, "utf8");
    if (!readme.includes("This is not a real cloud deployment")) {
      issues.push("README does not state the deployment boundary");
    }
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
