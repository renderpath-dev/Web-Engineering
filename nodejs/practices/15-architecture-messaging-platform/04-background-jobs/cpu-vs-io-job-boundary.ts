export type BackgroundWork = {
  cpuBound: boolean;
  waitsOnNetwork: boolean;
  mustShareMemoryWithApi: boolean;
};

export function chooseExecutionBoundary(work: BackgroundWork): "worker-service" | "worker-thread" | "api-handler" {
  if (work.mustShareMemoryWithApi) return "api-handler";
  if (work.cpuBound && !work.waitsOnNetwork) return "worker-thread";
  return "worker-service";
}
