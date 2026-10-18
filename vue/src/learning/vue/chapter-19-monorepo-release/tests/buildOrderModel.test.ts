import { describe, expect, it } from "vitest";
import {
  buildGraphEdges,
  buildPackages,
  createBuildOrder,
  mustBuildBefore,
} from "../models/buildOrderModel";

describe("buildOrderModel", () => {
  it("builds library package before consuming app package", () => {
    const order = createBuildOrder(buildPackages, buildGraphEdges);

    expect(mustBuildBefore("@vue-lab/design-system", "@vue-lab/admin-app", order)).toBe(
      true,
    );
  });
});

