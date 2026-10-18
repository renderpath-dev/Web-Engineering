import { describe, expect, it } from "vitest";
import { buildCspPolicy } from "../models/cspPolicyModel";

describe("cspPolicyModel", () => {
  it("builds report-only headers by default", () => {
    const policy = buildCspPolicy({
      mode: "report-only",
      allowImagesFromDataSource: false,
      blockEmbedding: true,
    });

    expect(policy.headerName).toBe("Content-Security-Policy-Report-Only");
    expect(policy.directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(policy.serialized).toContain("script-src 'self'");
  });

  it("can switch to enforcement header naming", () => {
    const policy = buildCspPolicy({
      mode: "enforce",
      allowImagesFromDataSource: true,
      blockEmbedding: false,
    });

    expect(policy.headerName).toBe("Content-Security-Policy");
    expect(policy.directives["frame-ancestors"]).toEqual(["'self'"]);
    expect(policy.directives["img-src"]).toContain("data:");
  });
});
