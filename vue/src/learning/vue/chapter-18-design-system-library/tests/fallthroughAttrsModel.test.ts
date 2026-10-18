import { describe, expect, it } from "vitest";
import { assessAttrForwarding } from "../models/fallthroughAttrsModel";

describe("fallthroughAttrsModel", () => {
  it("flags wrapper forwarding as risky for native controls", () => {
    expect(
      assessAttrForwarding({
        componentName: "DsButton",
        target: "wrapper",
        multiRoot: false,
        forwardsListeners: true,
      }),
    ).toBe("risky");
  });
});
