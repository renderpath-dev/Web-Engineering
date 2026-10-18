import v8 from "node:v8";

export function readHeapLimit() {
  const statistics = v8.getHeapStatistics();
  return {
    heapSizeLimit: statistics.heap_size_limit,
    usedHeapSize: statistics.used_heap_size
  };
}
