import { describe, expect, it } from "vitest";
import {
  createErrorTelemetryRecord,
  normalizeErrorMessage,
} from "../models/errorTelemetryModel";

describe("errorTelemetryModel", () => {
  it("normalizes unknown error values", () => {
    expect(normalizeErrorMessage({ code: "failed" })).toBe("Unknown error");
  });

  it("redacts contact data in app-level records", () => {
    const record = createErrorTelemetryRecord({
      source: "app-handler",
      error: new Error("Contact learner@example.test failed"),
      componentName: "ProfilePanel",
      info: "render",
      releaseId: "release-17-local",
    });

    expect(record.message).toContain("[redacted-email]");
    expect(record.redacted).toBe(true);
  });
});
