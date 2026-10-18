import { describe, expect, it } from "vitest";
import { apiSecurityPolicies } from "../models/apiSecurityBoundaryModel";
import {
  createSecureRequestHeaders,
  requiresServerCsrfValidation,
} from "../models/csrfRequestModel";

describe("csrfRequestModel", () => {
  it("adds a CSRF header only when the policy requires it", () => {
    const policy = apiSecurityPolicies.find((item) => item.endpoint === "/api/settings");

    expect(policy).toBeDefined();

    const headers = createSecureRequestHeaders({
      policy: policy ?? apiSecurityPolicies[0],
      csrfToken: "demo-token",
    });

    expect(headers["X-CSRF-Token"]).toBe("demo-token");
    expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
  });

  it("keeps server validation as the authority signal", () => {
    const policy = apiSecurityPolicies.find((item) => item.endpoint === "/api/settings");

    expect(requiresServerCsrfValidation(policy ?? apiSecurityPolicies[0])).toBe(true);
  });
});
