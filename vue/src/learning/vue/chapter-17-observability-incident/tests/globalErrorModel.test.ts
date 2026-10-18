import { describe, expect, it } from "vitest";
import { normalizeGlobalErrorSignal } from "../models/globalErrorModel";

describe("globalErrorModel", () => {
  it("normalizes window error signals", () => {
    const signal = normalizeGlobalErrorSignal({
      kind: "window-error",
      message: "Synchronous failure",
      source: "browser-window",
    });

    expect(signal.userVisible).toBe(true);
    expect(signal.message).toBe("Synchronous failure");
  });

  it("normalizes unhandled rejection reasons", () => {
    const signal = normalizeGlobalErrorSignal({
      kind: "unhandled-rejection",
      reason: new Error("Async rejected"),
    });

    expect(signal.kind).toBe("unhandled-rejection");
    expect(signal.userVisible).toBe(false);
  });
});
