import { Router } from "express";
import { validateBody } from "../../shared/validation/validate-request.js";
import {
  dockerCheckController,
  kubernetesCheckController,
  projectSecretAuditController,
  scanSecretController,
  securityPolicyController,
  workflowCheckController
} from "./security.controller.js";
import { scanSecretBodySchema } from "./security.schema.js";

export const securityRouter = Router();

securityRouter.get("/policy", securityPolicyController);
securityRouter.post("/scan-secret", validateBody(scanSecretBodySchema), scanSecretController);
securityRouter.get("/secret-check", projectSecretAuditController);
securityRouter.get("/workflow-check", workflowCheckController);
securityRouter.get("/docker-check", dockerCheckController);
securityRouter.get("/k8s-check", kubernetesCheckController);
