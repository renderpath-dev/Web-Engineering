import { refreshMemoryMetrics } from "../../observability/memory-metrics.js";

export function readMemorySample() {
  const sample = refreshMemoryMetrics();
  return {
    process: {
      rss: sample.process.rss,
      heapTotal: sample.process.heapTotal,
      heapUsed: sample.process.heapUsed,
      external: sample.process.external,
      arrayBuffers: sample.process.arrayBuffers
    },
    heap: {
      heapSizeLimit: sample.heap.heap_size_limit,
      totalHeapSize: sample.heap.total_heap_size,
      usedHeapSize: sample.heap.used_heap_size
    }
  };
}
