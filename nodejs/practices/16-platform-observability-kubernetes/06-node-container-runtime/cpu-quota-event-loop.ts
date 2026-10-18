export function eventLoopRisk(cpuQuotaRatio: number, synchronousMilliseconds: number): "normal" | "risky" {
  return cpuQuotaRatio < 1 && synchronousMilliseconds > 50 ? "risky" : "normal";
}
