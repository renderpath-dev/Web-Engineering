type RequestLog = { level: "info"; time: string; message: string; requestId: string; route: string; statusCode: number; durationMs: number };
const log: RequestLog = { level: "info", time: new Date("2026-01-01T00:00:00.000Z").toISOString(), message: "request completed", requestId: "req_01", route: "/notes/:noteId", statusCode: 200, durationMs: 18.4 };
console.log(JSON.stringify(log));
