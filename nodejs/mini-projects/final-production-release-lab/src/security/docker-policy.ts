import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface DockerPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function includesLine(source: string, pattern: RegExp): boolean {
  return source.split(/\r?\n/).some((line) => pattern.test(line.trim()));
}

export function evaluateDockerPolicy(): DockerPolicyResult {
  const issues: string[] = [];
  const dockerfilePath = fromProjectRoot("Dockerfile");
  const dockerignorePath = fromProjectRoot(".dockerignore");
  const composePath = fromProjectRoot("compose.yaml");

  if (!existsSync(dockerfilePath)) {
    issues.push("Dockerfile is missing");
  } else {
    const dockerfile = readFileSync(dockerfilePath, "utf8");
    const fromCount = dockerfile.split(/\r?\n/).filter((line) => /^FROM\s+/i.test(line.trim())).length;
    if (fromCount < 2) issues.push("Dockerfile is not multi-stage");
    if (!includesLine(dockerfile, /^RUN\s+npm\s+ci\b/i)) issues.push("Dockerfile does not use npm ci");
    if (!includesLine(dockerfile, /^USER\s+appuser\b/i)) issues.push("Dockerfile does not use the non-root runtime user");
    if (/\bARG\b.*(?:SECRET|TOKEN|PASSWORD|KEY)/i.test(dockerfile)) issues.push("Dockerfile uses build arguments for sensitive values");
    if (/\bENV\b.*(?:SECRET|TOKEN|PASSWORD|KEY)/i.test(dockerfile)) issues.push("Dockerfile uses environment variables for sensitive values");
    if (!includesLine(dockerfile, /^HEALTHCHECK\b/i)) issues.push("Dockerfile does not define HEALTHCHECK");
  }

  if (!existsSync(dockerignorePath)) {
    issues.push(".dockerignore is missing");
  } else {
    const dockerignore = readFileSync(dockerignorePath, "utf8");
    for (const requiredEntry of ["node_modules", "dist", "coverage", ".env", ".git"]) {
      if (!dockerignore.split(/\r?\n/).includes(requiredEntry)) {
        issues.push(".dockerignore does not exclude " + requiredEntry);
      }
    }
  }

  if (!existsSync(composePath)) {
    issues.push("compose.yaml is missing");
  } else {
    const compose = parse(readFileSync(composePath, "utf8")) as unknown;
    const services = isRecord(compose) && isRecord(compose.services) ? compose.services : {};
    if (!isRecord(services.api)) issues.push("compose api service is missing");
    if (!isRecord(services.nginx)) issues.push("compose nginx service is missing");
    if (isRecord(services.nginx)) {
      const ports = Array.isArray(services.nginx.ports) ? services.nginx.ports : [];
      if (!ports.includes("8080:80")) issues.push("nginx does not expose host port 8080");
    }
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
