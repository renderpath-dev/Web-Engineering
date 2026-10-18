export type MetricLabelSet = {
  operationId?: string;
  route?: string;
  statusClass?: string;
  result?: string;
};

export function hasHighCardinalityLabel(labels: MetricLabelSet): boolean {
  return Object.keys(labels).some((key) => key === "userId" || key === "noteId" || key === "rawUrl");
}
