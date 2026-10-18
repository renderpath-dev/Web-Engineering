import type { RequestHandler } from "express";
import { deprecatedDemoPolicy } from "../../contracts/deprecation-policy.js";
import { recordDeprecatedUsage } from "../../observability/contract-metrics.js";
import { sendJson } from "../../shared/responses/send-response.js";

export const getVersion: RequestHandler = (_request, response) => {
  sendJson(response, 200, {
    apiVersion: "v1",
    openapi: "3.1.1",
    deprecatedOperations: [deprecatedDemoPolicy.operationId]
  });
};

export const getDeprecatedDemo: RequestHandler = (_request, response) => {
  recordDeprecatedUsage(deprecatedDemoPolicy.operationId);
  response.setHeader("Deprecation", deprecatedDemoPolicy.deprecation);
  response.setHeader("Sunset", deprecatedDemoPolicy.sunset);
  response.setHeader("Link", deprecatedDemoPolicy.link);
  sendJson(response, 200, {
    message: "This endpoint is deprecated.",
    replacement: "/v1/version"
  });
};
