import { describe, expect, it } from "vitest";
import { legacyModelContract } from "../legacy-shaped/legacyTemplateDirectiveExamples";
import {
  createModernModelContract,
  createStableKeyMap,
  filterVisibleItems,
  isSubmitKeyboardEvent,
  mergeAttributesInVue3Order,
  type ListItem,
} from "../modernized/templateDirectiveMigration";

describe("template directive migration", () => {
  it("maps the legacy model contract to the modern event contract", () => {
    expect(createModernModelContract(legacyModelContract)).toEqual({
      prop: "modelValue",
      event: "update:modelValue",
    });
  });

  it("moves v-if and v-for behavior into a filtered collection owner", () => {
    const items: ReadonlyArray<ListItem> = [
      { id: "active", visible: true, label: "Active row" },
      { id: "hidden", visible: false, label: "Hidden row" },
    ];

    expect(filterVisibleItems(items).map((item) => item.id)).toEqual(["active"]);
    expect(createStableKeyMap(items)).toEqual(["active", "hidden"]);
  });

  it("makes v-bind merge order explicit", () => {
    expect(
      mergeAttributesInVue3Order({
        staticValue: "card",
        boundValue: "selected",
        order: "static-first",
      }),
    ).toBe("card selected");
  });

  it("uses named keyboard values instead of numeric keyCode checks", () => {
    expect(isSubmitKeyboardEvent("Enter")).toBe(true);
    expect(isSubmitKeyboardEvent("Escape")).toBe(false);
  });
});
