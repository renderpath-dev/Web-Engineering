export interface RovingItem {
  readonly id: string;
  readonly label: string;
}

export interface RovingTabState {
  readonly items: ReadonlyArray<RovingItem>;
  readonly activeIndex: number;
}

export type RovingMoveTarget = "next" | "previous" | "first" | "last";

export function moveRovingIndex(
  state: RovingTabState,
  target: RovingMoveTarget,
): number {
  if (target === "first") {
    return 0;
  }

  if (target === "last") {
    return Math.max(state.items.length - 1, 0);
  }

  const offset = target === "next" ? 1 : -1;

  return (state.activeIndex + offset + state.items.length) % state.items.length;
}

export function getRovingTabIndex(state: RovingTabState, itemIndex: number): 0 | -1 {
  return itemIndex === state.activeIndex ? 0 : -1;
}

export function getActiveRovingItem(state: RovingTabState): RovingItem {
  const item = state.items[state.activeIndex];

  if (!item) {
    throw new Error("Roving widget has no active item");
  }

  return item;
}

export function getRovingSelectedState(
  state: RovingTabState,
  itemIndex: number,
): "true" | "false" {
  return itemIndex === state.activeIndex ? "true" : "false";
}
