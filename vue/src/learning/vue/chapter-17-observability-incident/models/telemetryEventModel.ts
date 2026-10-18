export type TelemetrySeverity = "debug" | "info" | "warning" | "error" | "critical";
export type TelemetrySource =
  | "vue-app"
  | "component-boundary"
  | "browser-global"
  | "api-client"
  | "route"
  | "performance"
  | "release"
  | "incident";

export interface TelemetryEvent {
  readonly eventName: string;
  readonly source: TelemetrySource;
  readonly severity: TelemetrySeverity;
  readonly timestamp: number;
  readonly routeName: string;
  readonly releaseId: string;
  readonly context: Readonly<Record<string, string>>;
  readonly redacted: boolean;
}

export function createTelemetryEvent(input: {
  readonly eventName: string;
  readonly source: TelemetrySource;
  readonly severity: TelemetrySeverity;
  readonly routeName: string;
  readonly releaseId: string;
  readonly context?: Readonly<Record<string, string>>;
  readonly timestamp?: number;
  readonly redacted?: boolean;
}): TelemetryEvent {
  return {
    eventName: input.eventName,
    source: input.source,
    severity: input.severity,
    timestamp: input.timestamp ?? Date.now(),
    routeName: input.routeName,
    releaseId: input.releaseId,
    context: input.context ?? {},
    redacted: input.redacted ?? false,
  };
}

export function hasUnknownTelemetryFields(
  event: TelemetryEvent,
  allowedFields: ReadonlyArray<string>,
): boolean {
  const allowed = new Set(allowedFields);

  return Object.keys(event.context).some((field) => !allowed.has(field));
}
