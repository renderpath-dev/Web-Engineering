import type { Request, Response } from "express";
import { sendResponse } from "../../shared/responses/send-response.js";
import { reliabilityService } from "./reliability.service.js";

export const reliabilityController = {
  async timeoutDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.timeoutDemo());
  },

  async abortDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.abortDemo());
  },

  async retryDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.retryDemo());
  },

  async circuitBreaker(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.circuitBreakerDemo());
  },

  async bulkhead(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.bulkheadDemo());
  },

  async degradedCache(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.degradedCacheDemo());
  },

  async idempotentOperation(request: Request, response: Response) {
    const result = await reliabilityService.idempotentOperation(
      request.method,
      request.path,
      request.get("idempotency-key"),
      request.body
    );
    response.setHeader("idempotency-replayed", String(result.replayed));
    sendResponse(response, result.statusCode, result.body);
  },

  async faultInjection(request: Request, response: Response) {
    const result = reliabilityService.applyFaultScenario(request.body.scenario);
    sendResponse(response, 200, result);
  }
};
