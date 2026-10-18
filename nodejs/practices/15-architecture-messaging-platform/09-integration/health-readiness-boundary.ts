export type ReadinessSignal = {
  databaseReady: boolean;
  redisReady: boolean;
  queueReady: boolean;
};

export function isServiceReady(signal: ReadinessSignal): boolean {
  return signal.databaseReady && signal.redisReady && signal.queueReady;
}
