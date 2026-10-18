
export type WorkloadKind = "cpu-js" | "http-scale" | "external-program";

export interface RuntimeBoundaryDecision {
  workload: WorkloadKind;
  primitive: "worker_threads" | "cluster" | "child_process";
  boundary: "thread" | "node-process" | "external-process";
}

export function chooseRuntimeBoundary(workload: WorkloadKind): RuntimeBoundaryDecision {
  if (workload === "cpu-js") {
    return { workload, primitive: "worker_threads", boundary: "thread" };
  }
  if (workload === "http-scale") {
    return { workload, primitive: "cluster", boundary: "node-process" };
  }
  return { workload, primitive: "child_process", boundary: "external-process" };
}
