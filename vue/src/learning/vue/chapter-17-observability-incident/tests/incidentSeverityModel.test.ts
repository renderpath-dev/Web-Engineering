import { describe, expect, it } from "vitest";
import { classifyIncidentSeverity } from "../models/incidentSeverityModel";

describe("incidentSeverityModel", () => {
  it("classifies critical path failures as sev1", () => {
    expect(
      classifyIncidentSeverity({
        affectedUserPercent: 5,
        criticalPathDown: true,
        durationMinutes: 10,
      }),
    ).toBe("sev1");
  });

  it("classifies limited impact as sev3", () => {
    expect(
      classifyIncidentSeverity({
        affectedUserPercent: 1,
        criticalPathDown: false,
        durationMinutes: 20,
      }),
    ).toBe("sev3");
  });
});
