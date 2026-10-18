export type WorkerUnitObservation = {
  payloadValidated: boolean;
  databaseUpdated: boolean;
  cacheInvalidated: boolean;
};

export function workerUnitPassed(observation: WorkerUnitObservation): boolean {
  return observation.payloadValidated && observation.databaseUpdated && observation.cacheInvalidated;
}
