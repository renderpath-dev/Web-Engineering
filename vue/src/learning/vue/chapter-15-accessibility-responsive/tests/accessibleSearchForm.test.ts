import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AccessibleSearchForm from "../components/AccessibleSearchForm.vue";
import { validateSearchForm } from "../models/formAccessibilityModel";

describe("AccessibleSearchForm", () => {
  it("connects invalid fields to visible error messages", async () => {
    const wrapper = mount(AccessibleSearchForm);

    await wrapper.find("form").trigger("submit");

    const searchInput = wrapper.find('input[type="search"]');
    const statusSelect = wrapper.find("select");

    expect(searchInput.attributes("aria-invalid")).toBe("true");
    expect(statusSelect.attributes("aria-invalid")).toBe("true");
    expect(wrapper.text()).toContain("Fix the listed fields.");
  });

  it("validates search form state without mutating input data", () => {
    const errors = validateSearchForm({
      query: "a",
      status: "",
    });

    expect(errors.map((error) => error.fieldId)).toEqual(["query", "status"]);
  });
});

