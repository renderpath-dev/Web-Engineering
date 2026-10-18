import type { RequestHandler } from "express";
import { auditProjectSecrets, getDockerCheck, getKubernetesCheck, getSecurityPolicy, getWorkflowCheck } from "./security.service.js";
import { scanTextForSecrets } from "../../security/secret-scanner.js";

export const securityPolicyController: RequestHandler = (_request, response) => {
  response.json(getSecurityPolicy());
};

export const scanSecretController: RequestHandler = (request, response) => {
  const body = request.body as { text: string; filePath: string };
  const findings = scanTextForSecrets(body.filePath, body.text);
  response.json({
    status: findings.length === 0 ? "PASS" : "FAIL",
    findingCount: findings.length,
    findings
  });
};

export const projectSecretAuditController: RequestHandler = async (_request, response) => {
  response.json(await auditProjectSecrets());
};

export const workflowCheckController: RequestHandler = (_request, response) => {
  response.json(getWorkflowCheck());
};

export const dockerCheckController: RequestHandler = (_request, response) => {
  response.json(getDockerCheck());
};

export const kubernetesCheckController: RequestHandler = (_request, response) => {
  response.json(getKubernetesCheck());
};
