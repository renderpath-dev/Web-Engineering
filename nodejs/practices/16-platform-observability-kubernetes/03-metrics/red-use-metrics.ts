export type RedUseMetric = {
  method: "RED" | "USE";
  name: "rate" | "errors" | "duration" | "utilization" | "saturation";
};

export const apiMetrics: RedUseMetric[] = [
  { method: "RED", name: "rate" },
  { method: "RED", name: "errors" },
  { method: "RED", name: "duration" }
];
