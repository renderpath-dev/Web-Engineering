import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SortableResultsTable from "../components/SortableResultsTable.vue";
import {
  createSortButtonLabel,
  initialResultRows,
  sortRows,
} from "../models/tableAccessibilityModel";

describe("SortableResultsTable", () => {
  it("updates sortable header state through a native button", async () => {
    const wrapper = mount(SortableResultsTable);
    const header = wrapper.get("th[aria-sort]");
    const button = wrapper.get("th button");

    expect(header.attributes("aria-sort")).toBe("ascending");
    expect(button.text()).toBe("Sort by score, ascending");

    await button.trigger("click");

    expect(wrapper.get("th[aria-sort]").attributes("aria-sort")).toBe("descending");
  });

  it("sorts result rows through the shared table model", () => {
    const rows = sortRows(initialResultRows, {
      column: "score",
      direction: "descending",
    });

    expect(rows[0]?.score).toBe(92);
    expect(createSortButtonLabel("score", "ascending")).toBe("Sort by score, ascending");
  });
});

