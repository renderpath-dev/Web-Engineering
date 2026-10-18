import v8 from "node:v8";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const processMemoryBytes = new Gauge({
  name: "node_process_memory_bytes",
  help: "Process memory usage by field.",
  labelNames: ["field"] as const,
  registers: [metricsRegistry]
});

export const v8HeapBytes = new Gauge({
  name: "node_v8_heap_bytes",
  help: "V8 heap statistics by field.",
  labelNames: ["field"] as const,
  registers: [metricsRegistry]
});

export function refreshMemoryMetrics() {
  const memory = process.memoryUsage();
  processMemoryBytes.set({ field: "rss" }, memory.rss);
  processMemoryBytes.set({ field: "heapTotal" }, memory.heapTotal);
  processMemoryBytes.set({ field: "heapUsed" }, memory.heapUsed);
  processMemoryBytes.set({ field: "external" }, memory.external);
  processMemoryBytes.set({ field: "arrayBuffers" }, memory.arrayBuffers);

  const heap = v8.getHeapStatistics();
  v8HeapBytes.set({ field: "heap_size_limit" }, heap.heap_size_limit);
  v8HeapBytes.set({ field: "total_heap_size" }, heap.total_heap_size);
  v8HeapBytes.set({ field: "used_heap_size" }, heap.used_heap_size);

  return {
    process: memory,
    heap
  };
}
