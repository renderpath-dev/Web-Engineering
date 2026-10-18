export interface RedactionResult {
  readonly context: Readonly<Record<string, string>>;
  readonly redactedFields: ReadonlyArray<string>;
}

const queryPattern = /\?.*$/u;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu;
const tokenPattern = /(token|secret|credential)=([^&\s]+)/giu;

export const redactionDemoContext: Readonly<Record<string, string>> = {
  contact: "learner@example.test",
  path: "/account?email=learner@example.test&token=demo-token-value",
};

export function redactTelemetryValue(value: string): string {
  return value
    .replace(emailPattern, "[redacted-email]")
    .replace(tokenPattern, "$1=[redacted]")
    .replace(queryPattern, "?[redacted]");
}

export function redactTelemetryContext(
  context: Readonly<Record<string, string>>,
): RedactionResult {
  const redactedEntries = Object.entries(context).map(([key, value]) => {
    const redactedValue = redactTelemetryValue(value);

    return [key, redactedValue] as const;
  });
  const redactedFields = redactedEntries
    .filter(([key, value]) => context[key] !== value)
    .map(([key]) => key);

  return {
    context: Object.fromEntries(redactedEntries),
    redactedFields,
  };
}
