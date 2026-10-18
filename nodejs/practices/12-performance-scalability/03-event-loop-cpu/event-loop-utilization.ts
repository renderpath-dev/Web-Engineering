
import { performance } from "node:perf_hooks";

export function measureBusyLoop(iterations: number) {
  const before = performance.eventLoopUtilization();
  let value = 0;
  for (let index = 0; index < iterations; index += 1) {
    value += Math.sqrt(index + 1);
  }
  const after = performance.eventLoopUtilization(before);
  return {
    value: Number(value.toFixed(3)),
    utilization: after.utilization
  };
}
