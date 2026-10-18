export type GlobalErrorKind = "window-error" | "unhandled-rejection";

export interface GlobalErrorSignal {
  readonly kind: GlobalErrorKind;
  readonly message: string;
  readonly source: string;
  readonly userVisible: boolean;
}

export function normalizeGlobalErrorSignal(input: {
  readonly kind: GlobalErrorKind;
  readonly message?: string;
  readonly reason?: unknown;
  readonly source?: string;
}): GlobalErrorSignal {
  const reasonMessage =
    input.reason instanceof Error
      ? input.reason.message
      : typeof input.reason === "string"
        ? input.reason
        : undefined;

  return {
    kind: input.kind,
    message: input.message ?? reasonMessage ?? "Unknown global error",
    source: input.source ?? "browser-window",
    userVisible: input.kind === "window-error",
  };
}
