const signalMap = new Map<string, string[]>([
  ["slow request", ["http_request_duration_seconds", "trace spans", "request logs"]],
  ["high error rate", ["http_requests_total", "error logs"]],
  ["database unavailable", ["readiness", "Prisma error log", "database span"]],
  ["Redis unavailable", ["readiness", "Redis client event", "Redis span"]],
  ["memory growth", ["process_resident_memory_bytes", "private diagnostic report"]],
  ["event loop delay", ["nodejs_event_loop_delay_seconds"]]
]);
for (const [symptom, signals] of signalMap) console.log(`${symptom}: ${signals.join(", ")}`);
