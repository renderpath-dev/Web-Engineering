export function live() { return { ok: true, data: { status: "live", uptimeSeconds: process.uptime() } }; }
export function ready(postgresReady: boolean, redisReady: boolean) {
  const ok = postgresReady && redisReady;
  return { ok, data: { status: ok ? "ready" : "not_ready", dependencies: { postgres: postgresReady ? "ready" : "unavailable", redis: redisReady ? "ready" : "unavailable" } } };
}
console.log(live());
console.log(ready(true, false));
