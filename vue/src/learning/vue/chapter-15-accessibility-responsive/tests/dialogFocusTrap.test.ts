import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import AccessibleDialog from "../components/AccessibleDialog.vue";
import {
  getDialogReturnTarget,
  getNextDialogFocusId,
  type DialogFocusState,
} from "../models/dialogAccessibilityModel";

describe("AccessibleDialog", () => {
  it("opens a dialog with modal semantics and closes on Escape", async () => {
    const wrapper = mount(AccessibleDialog, {
      attachTo: document.body,
    });

    await wrapper.get("#open-accessibility-dialog").trigger("click");
    await nextTick();
    await nextTick();

    const dialog = document.querySelector('[role="dialog"]');

    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement?.id).toBe("accessibility-dialog-confirm");

    dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    await nextTick();

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement?.id).toBe("open-accessibility-dialog");
    wrapper.unmount();
  });

  it("cycles focus with Tab and Shift Tab inside the dialog", async () => {
    const wrapper = mount(AccessibleDialog, {
      attachTo: document.body,
    });

    await wrapper.get("#open-accessibility-dialog").trigger("click");
    await nextTick();
    await nextTick();

    const dialog = document.querySelector('[role="dialog"]');

    expect(document.activeElement?.id).toBe("accessibility-dialog-confirm");

    dialog?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    await nextTick();

    expect(document.activeElement?.id).toBe("accessibility-dialog-cancel");

    dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await nextTick();

    expect(document.activeElement?.id).toBe("accessibility-dialog-confirm");
    wrapper.unmount();
  });

  it("cycles focus ids inside the dialog model", () => {
    const state: DialogFocusState = {
      open: true,
      triggerId: "open-accessibility-dialog",
      focusableIds: ["confirm-action", "cancel-action"],
      activeId: "confirm-action",
    };

    expect(getNextDialogFocusId(state, "forward")).toBe("cancel-action");
    expect(getDialogReturnTarget(state, "cancel")).toBe("open-accessibility-dialog");
  });
});
