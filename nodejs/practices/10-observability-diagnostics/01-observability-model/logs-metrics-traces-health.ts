type Signal = { name: string; question: string; example: Record<string, string | number | boolean> };
const signals: Signal[] = [
  { name: "log", question: "What happened for one operation?", example: { requestId: "req_123", route: "/notes/:noteId" } },
  { name: "metric", question: "How often or how much is it happening?", example: { name: "http_requests_total", status_class: "2xx" } },
  { name: "trace", question: "Where did time go across steps?", example: { traceId: "trace_123", span: "notes.list" } },
  { name: "health", question: "Can this service receive traffic?", example: { endpoint: "/health/ready", postgres: "ready" } },
  { name: "diagnostic-report", question: "What process state existed during severe failure?", example: { publicEndpoint: false } }
];
for (const signal of signals) console.log(JSON.stringify(signal));
