import { describe, expect, it } from "vitest";
import { reviewRouteAuthorization } from "../models/routeAuthorizationBoundaryModel";

describe("routeAuthorizationBoundaryModel", () => {
  it("hides UX routes when the client role is absent", () => {
    const review = reviewRouteAuthorization({
      routeName: "admin-users",
      hasClientRole: false,
      apiRequiresServerRole: true,
    });

    expect(review.decision).toBe("hide-ux-route");
    expect(review.backendAuthorityRequired).toBe(true);
  });

  it("keeps backend authority even when the route is visible", () => {
    const review = reviewRouteAuthorization({
      routeName: "admin-users",
      hasClientRole: true,
      apiRequiresServerRole: true,
    });

    expect(review.decision).toBe("require-backend-check");
  });
});
