export type RouteAccessDecision = "allow-ux-route" | "hide-ux-route" | "require-backend-check";

export interface RouteAuthorizationInput {
  readonly routeName: string;
  readonly hasClientRole: boolean;
  readonly apiRequiresServerRole: boolean;
}

export interface RouteAuthorizationReview {
  readonly routeName: string;
  readonly decision: RouteAccessDecision;
  readonly backendAuthorityRequired: boolean;
  readonly reason: string;
}

export function reviewRouteAuthorization(
  input: RouteAuthorizationInput,
): RouteAuthorizationReview {
  if (!input.hasClientRole) {
    return {
      routeName: input.routeName,
      decision: "hide-ux-route",
      backendAuthorityRequired: true,
      reason: "Client route guard can hide navigation but cannot authorize data.",
    };
  }

  if (input.apiRequiresServerRole) {
    return {
      routeName: input.routeName,
      decision: "require-backend-check",
      backendAuthorityRequired: true,
      reason: "API must verify the role even when the route is visible.",
    };
  }

  return {
    routeName: input.routeName,
    decision: "allow-ux-route",
    backendAuthorityRequired: true,
    reason: "Route is visible, but backend remains the authority for data.",
  };
}
