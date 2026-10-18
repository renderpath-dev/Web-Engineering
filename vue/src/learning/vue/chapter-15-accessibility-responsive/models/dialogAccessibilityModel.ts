export type DialogCloseReason = "escape" | "cancel" | "confirm";

export interface DialogFocusState {
  readonly open: boolean;
  readonly triggerId: string;
  readonly focusableIds: ReadonlyArray<string>;
  readonly activeId: string;
}

export function getNextDialogFocusId(
  state: DialogFocusState,
  direction: "forward" | "backward",
): string {
  const currentIndex = state.focusableIds.indexOf(state.activeId);
  const fallbackIndex = currentIndex < 0 ? 0 : currentIndex;
  const offset = direction === "forward" ? 1 : -1;
  const nextIndex =
    (fallbackIndex + offset + state.focusableIds.length) %
    state.focusableIds.length;

  return state.focusableIds[nextIndex] ?? state.triggerId;
}

export function getDialogReturnTarget(
  state: DialogFocusState,
  reason: DialogCloseReason,
): string {
  void reason;

  return state.triggerId;
}
