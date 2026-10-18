import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import NativeControlBoundaryDemo from "../components/NativeControlBoundaryDemo.vue";
import {
  getActivationRule,
  keyActivatesControl,
  nativeControlReviewItems,
  shouldPreferNativeControl,
} from "../models/keyboardInteractionModel";

describe("NativeControlBoundaryDemo", () => {
  it("marks native button Enter and Space as activation keys", () => {
    expect(keyActivatesControl("button", "Enter")).toBe(true);
    expect(keyActivatesControl("button", " ")).toBe(true);
    expect(shouldPreferNativeControl("button")).toBe(true);
  });

  it("marks native link Enter as the activation key", () => {
    expect(keyActivatesControl("link", "Enter")).toBe(true);
    expect(keyActivatesControl("link", " ")).toBe(false);
    expect(getActivationRule("link").preferredElement).toBe("a[href]");
  });

  it("marks custom controls as requiring manual keyboard implementation", () => {
    const customRule = getActivationRule("custom");

    expect(customRule.requiresManualKeyboardImplementation).toBe(true);
    expect(shouldPreferNativeControl("custom")).toBe(false);
  });

  it("renders native controls without implementing a clickable custom div", async () => {
    const wrapper = mount(NativeControlBoundaryDemo);
    const button = wrapper.get("button");
    const link = wrapper.get("a[href='#chapter-15-main']");

    await button.trigger("click");

    expect(wrapper.text()).toContain("Native button activations: 1");
    expect(link.text()).toBe("Native link action");
    expect(nativeControlReviewItems.some((item) => item.id === "custom-risk")).toBe(true);
  });
});
