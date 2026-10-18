export type AlertWindow = {
  threshold: number;
  durationMinutes: number;
};

export function shouldAlert(value: number, window: AlertWindow): boolean {
  return value > window.threshold && window.durationMinutes >= 5;
}
