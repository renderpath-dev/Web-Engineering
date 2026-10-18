export type ProducerContractObservation = {
  responseStatus: number;
  jobIdReturned: boolean;
  queueJobCreated: boolean;
};

export function producerContractPassed(observation: ProducerContractObservation): boolean {
  return observation.responseStatus === 202 && observation.jobIdReturned && observation.queueJobCreated;
}
