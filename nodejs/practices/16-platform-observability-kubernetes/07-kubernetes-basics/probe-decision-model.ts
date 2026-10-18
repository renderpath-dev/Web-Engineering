export type ProbeKind = "liveness" | "readiness" | "startup";

export function failureEffect(probe: ProbeKind): "restart" | "remove-from-traffic" | "protect-startup" {
  if (probe === "liveness") return "restart";
  if (probe === "readiness") return "remove-from-traffic";
  return "protect-startup";
}
