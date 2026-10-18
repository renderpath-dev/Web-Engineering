export function normalizeQueueDepthMetric(queueName: string, depth: number): Record<string, string | number> {
  return {
    queue_name: queueName,
    depth
  };
}
