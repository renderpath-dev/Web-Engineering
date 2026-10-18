import { Router } from "express";
import { validateBody } from "../../shared/validation/validate-request.js";
import {
  evaluateReleaseController,
  portfolioEvidenceController,
  releaseManifestController,
  releasePolicyController,
  rollbackDecisionController,
  rollbackPlanController
} from "./release.controller.js";
import { evaluateReleaseBodySchema } from "./release.schema.js";

export const releaseRouter = Router();

releaseRouter.get("/policy", releasePolicyController);
releaseRouter.get("/manifest", releaseManifestController);
releaseRouter.post("/evaluate", validateBody(evaluateReleaseBodySchema), evaluateReleaseController);
releaseRouter.post("/rollback-decision", validateBody(evaluateReleaseBodySchema), rollbackDecisionController);
releaseRouter.get("/rollback-plan", rollbackPlanController);
releaseRouter.get("/portfolio-evidence", portfolioEvidenceController);
