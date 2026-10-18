import type { RequestHandler } from "express";
import { evaluateRelease, getPortfolioEvidence, getReleaseManifest, getReleasePolicy, getRollbackDecision, getRollbackPlan } from "./release.service.js";

export const releasePolicyController: RequestHandler = (_request, response) => {
  response.json(getReleasePolicy());
};

export const releaseManifestController: RequestHandler = (_request, response) => {
  response.json(getReleaseManifest());
};

export const evaluateReleaseController: RequestHandler = (request, response) => {
  response.json(evaluateRelease(request.body));
};

export const rollbackPlanController: RequestHandler = (_request, response) => {
  response.json(getRollbackPlan());
};

export const rollbackDecisionController: RequestHandler = (request, response) => {
  response.json(getRollbackDecision(request.body));
};

export const portfolioEvidenceController: RequestHandler = (_request, response) => {
  response.json(getPortfolioEvidence());
};
