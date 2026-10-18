import type { LegacyModelContract } from "../legacy-shaped/legacyTemplateDirectiveExamples";

export type ModelContract = {
  readonly prop: "modelValue";
  readonly event: "update:modelValue";
};

export type AttributeMergeOrder = "static-first" | "bound-first";

export interface AttributeMergeInput {
  readonly staticValue: string;
  readonly boundValue: string;
  readonly order: AttributeMergeOrder;
}

export interface ListItem {
  readonly id: string;
  readonly visible: boolean;
  readonly label: string;
}

export function createModernModelContract(contract: LegacyModelContract): ModelContract {
  if (contract.prop !== "value" || contract.event !== "input") {
    throw new Error("Unsupported legacy model contract");
  }

  return {
    prop: "modelValue",
    event: "update:modelValue",
  };
}

export function filterVisibleItems(items: ReadonlyArray<ListItem>): ReadonlyArray<ListItem> {
  return items.filter((item) => item.visible);
}

export function mergeAttributesInVue3Order(input: AttributeMergeInput): string {
  const values =
    input.order === "static-first"
      ? [input.staticValue, input.boundValue]
      : [input.boundValue, input.staticValue];

  return values.filter((value) => value.length > 0).join(" ");
}

export function createStableKeyMap(
  items: ReadonlyArray<ListItem>,
): ReadonlyArray<string> {
  return items.map((item) => item.id);
}

export function isSubmitKeyboardEvent(eventKey: string): boolean {
  return eventKey === "Enter";
}

export const migrateModelContract = createModernModelContract;
export const getVisibleItems = filterVisibleItems;
export const mergeAttributeValue = mergeAttributesInVue3Order;
export const isEnterShortcut = isSubmitKeyboardEvent;
