export type ComponentRegistry = {
  schemas: Record<string, unknown>;
  responses: Record<string, unknown>;
};

export function canReuseProblemDetails(registry: ComponentRegistry): boolean {
  return "ProblemDetails" in registry.schemas && "ProblemResponse" in registry.responses;
}
