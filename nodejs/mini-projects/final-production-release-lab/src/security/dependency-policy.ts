import { existsSync, readFileSync } from "node:fs";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface DependencyPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
  auditCommand: string;
}

const requiredScripts = [
  "typecheck",
  "build",
  "test",
  "workflow:check",
  "dependency:check",
  "secret:check",
  "docker:check",
  "k8s:security:check",
  "release:check",
  "permission:check",
  "portfolio:check",
  "sbom:generate",
  "release:manifest"
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(fromProjectRoot(relativePath), "utf8")) as Record<string, unknown>;
}

function collectLatestVersions(value: unknown, path: string, issues: string[]): void {
  if (typeof value === "string") {
    if (value === "latest") {
      issues.push(path + " uses latest");
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectLatestVersions(entry, path + "[" + index + "]", issues));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      collectLatestVersions(nestedValue, path + "." + key, issues);
    }
  }
}

export function evaluateDependencyPolicy(): DependencyPolicyResult {
  const issues: string[] = [];
  const packageJsonPath = fromProjectRoot("package.json");
  const packageLockPath = fromProjectRoot("package-lock.json");

  if (!existsSync(packageJsonPath)) {
    issues.push("package.json is missing");
  }

  if (!existsSync(packageLockPath)) {
    issues.push("package-lock.json is missing");
  }

  if (existsSync(packageJsonPath)) {
    const packageJson = readJson("package.json");
    const scripts = packageJson.scripts && typeof packageJson.scripts === "object" ? packageJson.scripts as Record<string, unknown> : {};
    for (const scriptName of requiredScripts) {
      if (typeof scripts[scriptName] !== "string") {
        issues.push("script missing: " + scriptName);
      }
    }
    collectLatestVersions(packageJson.dependencies, "dependencies", issues);
    collectLatestVersions(packageJson.devDependencies, "devDependencies", issues);
  }

  if (existsSync(packageLockPath)) {
    const packageLock = readJson("package-lock.json");
    collectLatestVersions(packageLock, "package-lock", issues);
  }

  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues,
    auditCommand: "npm audit --audit-level=high"
  };
}
