export function getProcessResourceSnapshot() {
  const memory = process.memoryUsage();
  return { uptimeSeconds: process.uptime(), rssBytes: memory.rss, heapUsedBytes: memory.heapUsed };
}
console.log(getProcessResourceSnapshot());
