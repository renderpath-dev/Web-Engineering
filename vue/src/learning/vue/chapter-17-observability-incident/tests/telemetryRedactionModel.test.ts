import { describe, expect, it } from "vitest";
import {
  redactTelemetryContext,
  redactTelemetryValue,
} from "../models/telemetryRedactionModel";

describe("telemetryRedactionModel", () => {
  it("masks email and token-like fields", () => {
    const redacted = redactTelemetryValue(
      "contact=learner@example.test&token=demo-token-value",
    );

    expect(redacted).toContain("[redacted-email]");
    expect(redacted).toContain("token=[redacted]");
  });

  it("strips query strings from telemetry context values", () => {
    const result = redactTelemetryContext({
      path: "/account?email=learner@example.test&token=demo-token-value",
    });

    expect(result.context.path).toBe("/account?[redacted]");
    expect(result.redactedFields).toEqual(["path"]);
  });
});
