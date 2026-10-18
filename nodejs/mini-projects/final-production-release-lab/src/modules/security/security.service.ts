import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fromProjectRoot, projectRoot } from "../../release/artifact-hash.js";
import { evaluateDockerPolicy } from "../../security/docker-policy.js";
import { evaluateKubernetesPolicy } from "../../security/kubernetes-policy.js";
import { scanTextForSecrets, type SecretFinding } from "../../security/secret-scanner.js";
import { evaluateWorkflowPolicy } from "../../security/workflow-policy.js";

export interface SecurityAuditResult {
  status: "PASS" | "FAIL";
  findings: SecretFinding[];
  issues: string[];
}

const skippedDirectories = new Set(["node_modules", "dist", "coverage", ".git"]);
const skippedFiles = new Set(["package-lock.json"]);

function listSafeFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) {
        files.push(...listSafeFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && !skippedFiles.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function auditProjectSecrets(): Promise<SecurityAuditResult> {
  const issues: string[] = [];
  const findings: SecretFinding[] = [];
  const safeFiles = listSafeFiles(projectRoot);

  for (const file of safeFiles) {
    const name = basename(file);
    const projectRelativePath = relative(projectRoot, file).replace(/\\/g, "/");
    if (name.startsWith(".env") && name !== ".env.example") {
      issues.push("committed env file is not allowed: " + projectRelativePath);
      continue;
    }

    const text = readFileSync(file, "utf8");
    findings.push(...scanTextForSecrets(projectRelativePath, text));
  }

  const envExamplePath = fromProjectRoot(".env.example");
  if (!existsSync(envExamplePath)) {
    issues.push(".env.example is missing");
  }

  return {
    status: issues.length === 0 && findings.length === 0 ? "PASS" : "FAIL",
    findings,
    issues
  };
}

export function getSecurityPolicy() {
  return {
    headers: "helmet",
    cors: "configured-origin",
    rateLimit: "enabled",
    bodyLimit: "100kb",
    errors: "public-problem-details-without-stack",
    secrets: "placeholders-only",
    nodePermissionModel: "defense-in-depth"
  };
}

export function getWorkflowCheck() {
  return evaluateWorkflowPolicy();
}

export function getDockerCheck() {
  return evaluateDockerPolicy();
}

export function getKubernetesCheck() {
  return evaluateKubernetesPolicy();
}
