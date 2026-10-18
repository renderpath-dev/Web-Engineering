import { performance } from "node:perf_hooks";
export function recordHttpDuration(startedAt: number, statusCode: number) {
  return { method: "GET", route: "/notes/:noteId", statusClass: `${Math.trunc(statusCode / 100)}xx`, durationSeconds: (performance.now() - startedAt) / 1000 };
}
console.log(recordHttpDuration(performance.now() - 24, 200));
