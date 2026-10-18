import { describe, expect, it } from "vitest";
import {
  createComponentFallbackState,
  shouldPropagateError,
} from "../models/vueErrorBoundaryModel";

describe("vueErrorBoundaryModel", () => {
  it("models stopped propagation for handled component failures", () => {
    const state = createComponentFallbackState({
      message: "Widget failed",
      reportCreated: true,
      stopPropagation: true,
    });

    expect(state.hasError).toBe(true);
    expect(shouldPropagateError(state)).toBe(false);
  });

  it("keeps reporting separate from fallback display", () => {
    const state = createComponentFallbackState({
      message: "Widget failed",
      reportCreated: false,
      stopPropagation: false,
    });

    expect(state.reportCreated).toBe(false);
    expect(shouldPropagateError(state)).toBe(true);
  });
});
