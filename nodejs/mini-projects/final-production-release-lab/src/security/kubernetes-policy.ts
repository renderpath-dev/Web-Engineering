import { existsSync, readFileSync } from "node:fs";
import { parseAllDocuments } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";
import { scanTextForSecrets } from "./secret-scanner.js";

export interface KubernetesPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function loadYamlDocuments(relativePath: string): unknown[] {
  const path = fromProjectRoot(relativePath);
  if (!existsSync(path)) return [];
  return parseAllDocuments(readFileSync(path, "utf8")).map((document) => document.toJSON());
}

function findKind(documents: unknown[], kind: string): Record<string, unknown> | undefined {
  return documents.find((document): document is Record<string, unknown> => isRecord(document) && document.kind === kind);
}

export function evaluateKubernetesPolicy(): KubernetesPolicyResult {
  const issues: string[] = [];
  const requiredFiles = [
    "k8s/namespace.yaml",
    "k8s/configmap.yaml",
    "k8s/secret.example.yaml",
    "k8s/deployment.yaml",
    "k8s/service.yaml"
  ];

  for (const file of requiredFiles) {
    if (!existsSync(fromProjectRoot(file))) {
      issues.push(file + " is missing");
    }
  }

  const deployment = findKind(loadYamlDocuments("k8s/deployment.yaml"), "Deployment");
  const service = findKind(loadYamlDocuments("k8s/service.yaml"), "Service");
  if (!deployment) {
    issues.push("Deployment manifest is missing");
  }

  if (deployment) {
    const spec = isRecord(deployment.spec) ? deployment.spec : {};
    const template = isRecord(spec.template) ? spec.template : {};
    const templateMetadata = isRecord(template.metadata) ? template.metadata : {};
    const podLabels = isRecord(templateMetadata.labels) ? templateMetadata.labels : {};
    const podSpec = isRecord(template.spec) ? template.spec : {};
    const podSecurityContext = isRecord(podSpec.securityContext) ? podSpec.securityContext : {};
    const containers = Array.isArray(podSpec.containers) ? podSpec.containers : [];
    const firstContainer = isRecord(containers[0]) ? containers[0] : {};
    const containerSecurityContext = isRecord(firstContainer.securityContext) ? firstContainer.securityContext : {};
    const capabilities = isRecord(containerSecurityContext.capabilities) ? containerSecurityContext.capabilities : {};
    const resources = isRecord(firstContainer.resources) ? firstContainer.resources : {};
    const requests = isRecord(resources.requests) ? resources.requests : {};
    const limits = isRecord(resources.limits) ? resources.limits : {};
    const seccompProfile = isRecord(containerSecurityContext.seccompProfile) ? containerSecurityContext.seccompProfile : podSecurityContext.seccompProfile;

    if (podSecurityContext.runAsNonRoot !== true && containerSecurityContext.runAsNonRoot !== true) issues.push("runAsNonRoot is not true");
    if (containerSecurityContext.allowPrivilegeEscalation !== false) issues.push("allowPrivilegeEscalation is not false");
    if (containerSecurityContext.readOnlyRootFilesystem !== true) issues.push("readOnlyRootFilesystem is not true");
    if (!Array.isArray(capabilities.drop) || !capabilities.drop.includes("ALL")) issues.push("capabilities.drop does not include ALL");
    if (!isRecord(seccompProfile) || seccompProfile.type !== "RuntimeDefault") issues.push("seccompProfile RuntimeDefault is missing");
    if (typeof requests.cpu !== "string" || typeof requests.memory !== "string") issues.push("resource requests are incomplete");
    if (typeof limits.cpu !== "string" || typeof limits.memory !== "string") issues.push("resource limits are incomplete");
    if (!isRecord(firstContainer.livenessProbe)) issues.push("livenessProbe is missing");
    if (!isRecord(firstContainer.readinessProbe)) issues.push("readinessProbe is missing");

    if (service) {
      const serviceSpec = isRecord(service.spec) ? service.spec : {};
      const selector = isRecord(serviceSpec.selector) ? serviceSpec.selector : {};
      for (const [key, value] of Object.entries(selector)) {
        if (podLabels[key] !== value) {
          issues.push("Service selector does not match Deployment pod label " + key);
        }
      }
    }
  }

  const secretPath = fromProjectRoot("k8s/secret.example.yaml");
  if (existsSync(secretPath)) {
    const secretText = readFileSync(secretPath, "utf8");
    const findings = scanTextForSecrets("k8s/secret.example.yaml", secretText);
    if (findings.length > 0) {
      issues.push("secret.example.yaml contains secret-looking values");
    }
  }

  const manifestTexts = requiredFiles.filter((file) => existsSync(fromProjectRoot(file))).map((file) => readFileSync(fromProjectRoot(file), "utf8")).join("\n");
  if (/cloud\.google|amazonaws|azure\.com|service\.beta\.kubernetes\.io/i.test(manifestTexts)) {
    issues.push("cloud provider annotation or endpoint is present");
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
