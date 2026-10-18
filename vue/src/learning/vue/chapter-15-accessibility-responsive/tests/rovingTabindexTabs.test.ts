import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import RovingTabindexTabs from "../components/RovingTabindexTabs.vue";
import {
  getRovingTabIndex,
  moveRovingIndex,
  type RovingTabState,
} from "../models/rovingTabindexModel";

describe("RovingTabindexTabs", () => {
  it("keeps a single active tab stop while arrow keys move selection", async () => {
    const wrapper = mount(RovingTabindexTabs, {
      attachTo: document.body,
    });
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs[0]?.attributes("tabindex")).toBe("0");
    expect(tabs[1]?.attributes("tabindex")).toBe("-1");

    await tabs[0]?.trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[0]?.attributes("tabindex")).toBe("-1");
    expect(updatedTabs[1]?.attributes("tabindex")).toBe("0");
    expect(document.activeElement?.id).toBe("focus-order-tab");
    wrapper.unmount();
  });

  it("moves active tab with Home and End keys", async () => {
    const wrapper = mount(RovingTabindexTabs, {
      attachTo: document.body,
    });
    const tabs = wrapper.findAll('[role="tab"]');

    await tabs[0]?.trigger("keydown", { key: "End" });
    await nextTick();

    const endTabs = wrapper.findAll('[role="tab"]');
    expect(endTabs[2]?.attributes("tabindex")).toBe("0");
    expect(endTabs[0]?.attributes("tabindex")).toBe("-1");
    expect(document.activeElement?.id).toBe("responsive-check-tab");

    await endTabs[2]?.trigger("keydown", { key: "Home" });
    await nextTick();

    const homeTabs = wrapper.findAll('[role="tab"]');
    expect(homeTabs[0]?.attributes("tabindex")).toBe("0");
    expect(homeTabs[1]?.attributes("tabindex")).toBe("-1");
    expect(homeTabs[2]?.attributes("tabindex")).toBe("-1");
    expect(document.activeElement?.id).toBe("semantic-html-tab");
    wrapper.unmount();
  });

  it("wraps model movement across tab items", () => {
    const state: RovingTabState = {
      activeIndex: 0,
      items: [
        { id: "first", label: "First" },
        { id: "second", label: "Second" },
      ],
    };

    expect(moveRovingIndex(state, "previous")).toBe(1);
    expect(getRovingTabIndex(state, 0)).toBe(0);
    expect(getRovingTabIndex(state, 1)).toBe(-1);
  });
});
