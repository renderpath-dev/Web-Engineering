export function memoryPressureRatio(usedBytes: number, limitBytes: number): number {
  if (limitBytes <= 0) return 1;
  return usedBytes / limitBytes;
}
