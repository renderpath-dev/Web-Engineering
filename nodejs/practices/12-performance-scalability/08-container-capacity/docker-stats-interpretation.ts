
export interface DockerStatsRow {
  name: string;
  cpuPercent: number;
  memoryUsageMiB: number;
  memoryLimitMiB: number;
}

export function parseDockerStatsRow(line: string): DockerStatsRow {
  const [name, cpuRaw, memoryRaw] = line.trim().split(/\s{2,}/);
  const [usageRaw, limitRaw] = memoryRaw.split(" / ");
  return {
    name,
    cpuPercent: Number(cpuRaw.replace("%", "")),
    memoryUsageMiB: Number(usageRaw.replace("MiB", "")),
    memoryLimitMiB: Number(limitRaw.replace("MiB", ""))
  };
}

export function containerMemoryRatio(row: DockerStatsRow): number {
  return Number((row.memoryUsageMiB / row.memoryLimitMiB).toFixed(3));
}
