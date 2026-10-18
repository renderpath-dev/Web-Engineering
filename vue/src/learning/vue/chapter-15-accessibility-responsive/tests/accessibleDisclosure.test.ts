import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AccessibleDisclosure from "../components/AccessibleDisclosure.vue";

describe("AccessibleDisclosure", () => {
  it("updates expanded state and content visibility from the button", async () => {
    const wrapper = mount(AccessibleDisclosure);
    const button = wrapper.get("button");

    expect(button.attributes("aria-expanded")).toBe("false");
    expect(wrapper.text()).not.toContain("Tab reaches the button once.");

    await button.trigger("click");

    expect(button.attributes("aria-expanded")).toBe("true");
    expect(wrapper.text()).toContain("Tab reaches the button once.");
  });
});

