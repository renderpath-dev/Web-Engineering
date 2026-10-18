import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { reliabilityController } from "./reliability.controller.js";
import { faultInjectionSchema, idempotentOperationSchema } from "./reliability.schema.js";

export const reliabilityRoutes = Router();

reliabilityRoutes.get("/timeout-demo", reliabilityController.timeoutDemo);
reliabilityRoutes.get("/abort-demo", reliabilityController.abortDemo);
reliabilityRoutes.get("/retry-demo", reliabilityController.retryDemo);
reliabilityRoutes.get("/circuit-breaker", reliabilityController.circuitBreaker);
reliabilityRoutes.get("/bulkhead", reliabilityController.bulkhead);
reliabilityRoutes.get("/degraded-cache", reliabilityController.degradedCache);
reliabilityRoutes.post("/idempotent-operation", validateRequest({ body: idempotentOperationSchema }), reliabilityController.idempotentOperation);
reliabilityRoutes.post("/fault-injection", validateRequest({ body: faultInjectionSchema }), reliabilityController.faultInjection);
