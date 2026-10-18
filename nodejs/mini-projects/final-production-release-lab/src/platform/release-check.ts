import { evaluateReleaseGate, type GateSignal } from "../release/gate-model.js";
import { evaluateDependencyPolicy } from "../security/dependency-policy.js";
import { evaluateDockerPolicy } from "../security/docker-policy.js";
import { evaluateKubernetesPolicy } from "../security/kubernetes-policy.js";
import { auditProjectSecrets } from "../modules/security/security.service.js";
import { evaluateWorkflowPolicy } from "../security/workflow-policy.js";

function signal(name: string, status: "PASS" | "FAIL", evidence: string, critical: boolean): GateSignal {
  return { name, status, required: true, critical, evidence };
}

export async function evaluateLocalReleaseReadiness() {
  const workflow = evaluateWorkflowPolicy();
  const dependency = evaluateDependencyPolicy();
  const docker = evaluateDockerPolicy();
  const kubernetes = evaluateKubernetesPolicy();
  const secret = await auditProjectSecrets();

  return evaluateReleaseGate({
    phase: "pre-release",
    signals: [
      signal("workflow-security", workflow.status, "npm run workflow:check", true),
      signal("dependency-policy", dependency.status, "npm run dependency:check", false),
      signal("secret-scan", secret.status, "npm run secret:check", true),
      signal("docker-hardening", docker.status, "npm run docker:check", false),
      signal("kubernetes-security", kubernetes.status, "npm run k8s:security:check", false)
    ]
  });
}
