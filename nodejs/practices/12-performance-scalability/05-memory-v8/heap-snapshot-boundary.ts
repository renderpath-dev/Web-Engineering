
import v8 from "node:v8";

export function readSafeHeapDiagnostics() {
  const statistics = v8.getHeapStatistics();
  return {
    heapSizeLimit: statistics.heap_size_limit,
    totalHeapSize: statistics.total_heap_size,
    usedHeapSize: statistics.used_heap_size,
    externalMemory: statistics.external_memory
  };
}

export const localOnlyDiagnostic = "v8.writeHeapSnapshot() must stay outside public HTTP routes";
