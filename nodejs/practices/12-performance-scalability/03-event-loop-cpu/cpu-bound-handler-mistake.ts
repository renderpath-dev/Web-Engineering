
export function boundedCpuLoop(iterations: number): number {
  const safeIterations = Math.max(1, Math.min(iterations, 5_000_000));
  let total = 0;
  for (let index = 0; index < safeIterations; index += 1) {
    total = (total + Math.sqrt(index + 1)) % 1_000_000;
  }
  return Number(total.toFixed(3));
}

export async function asyncWrapperStillBlocks(iterations: number): Promise<number> {
  return boundedCpuLoop(iterations);
}
