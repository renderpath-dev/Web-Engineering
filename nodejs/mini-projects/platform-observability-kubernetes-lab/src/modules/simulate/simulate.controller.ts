import type { RequestHandler } from "express";
import type { createSloStore } from "../../slo/slo.service.js";
import { TraceWorkSchema } from "./simulate.schema.js";
import { createSimulationService } from "./simulate.service.js";

export function createSimulationController(sloStore: ReturnType<typeof createSloStore>) {
  const service = createSimulationService(sloStore);

  return {
    ok: ((_request, response) => response.json(service.ok())) satisfies RequestHandler,
    error: (() => service.error()) satisfies RequestHandler,
    slow: (async (_request, response) => response.json(await service.slow())) satisfies RequestHandler,
    eventLoopDelay: ((_request, response) => response.json(service.eventLoopDelay())) satisfies RequestHandler,
    traceWork: ((request, response) => {
      const input = TraceWorkSchema.parse(request.body ?? {});
      response.json(service.traceWork(input));
    }) satisfies RequestHandler
  };
}
