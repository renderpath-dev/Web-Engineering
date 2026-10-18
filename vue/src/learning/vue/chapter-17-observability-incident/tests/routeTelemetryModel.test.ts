import { describe, expect, it } from "vitest";
import {
  createRouteNavigationSignal,
  isSlowNavigation,
} from "../models/routeTelemetryModel";

describe("routeTelemetryModel", () => {
  it("removes query strings from route telemetry", () => {
    const signal = createRouteNavigationSignal({
      routeName: "orders-detail",
      fullPath: "/orders/preview?customer=redacted",
      durationMs: 450,
      failureReason: "none",
      taskContext: "order-review",
    });

    expect(signal.redactedPath).toBe("/orders/preview");
  });

  it("detects slow navigation using a budget", () => {
    const signal = createRouteNavigationSignal({
      routeName: "orders-detail",
      fullPath: "/orders/preview",
      durationMs: 900,
      failureReason: "none",
      taskContext: "order-review",
    });

    expect(isSlowNavigation(signal, 800)).toBe(true);
  });
});
