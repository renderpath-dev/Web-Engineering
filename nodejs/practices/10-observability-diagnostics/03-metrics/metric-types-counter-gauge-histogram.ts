type Rule = { kind: "counter" | "gauge" | "histogram"; validUse: string; invalidUse: string };
const rules: Rule[] = [
  { kind: "counter", validUse: "monotonic event count", invalidUse: "current memory" },
  { kind: "gauge", validUse: "value that can go up and down", invalidUse: "request total" },
  { kind: "histogram", validUse: "duration distribution", invalidUse: "unique request id" }
];
console.table(rules);
