const allowedLabels = new Set(["method", "route", "status_class", "dependency_name", "operation_name", "error_class"]);

export function assertLowCardinalityLabels(labels: Record<string, string>): void {
  for (const name of Object.keys(labels)) {
    if (!allowedLabels.has(name)) throw new Error("Unsafe metric label: " + name);
  }
}
