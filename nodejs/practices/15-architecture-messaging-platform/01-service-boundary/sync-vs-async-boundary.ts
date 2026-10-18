export type RequestWork = {
  needsImmediateBody: boolean;
  canReturnJobId: boolean;
  touchesExternalDependency: boolean;
};

export function classifyRequestWork(work: RequestWork): "synchronous-http" | "asynchronous-job" {
  if (work.needsImmediateBody) return "synchronous-http";
  if (work.canReturnJobId && work.touchesExternalDependency) return "asynchronous-job";
  return "synchronous-http";
}
