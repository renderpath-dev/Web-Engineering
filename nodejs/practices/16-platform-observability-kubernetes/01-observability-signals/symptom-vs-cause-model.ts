export type IncidentStatement = {
  symptom: string;
  possibleCause: string;
};

export function isUserVisibleSymptom(statement: IncidentStatement): boolean {
  return /latency|error|unavailable|timeout/i.test(statement.symptom);
}
