import { computed, nextTick, ref, type ComputedRef, type Ref } from "vue";
import {
  getNextDialogFocusId,
  type DialogCloseReason,
  type DialogFocusState,
} from "../models/dialogAccessibilityModel";

export interface DialogFocusTrapController {
  readonly open: Ref<boolean>;
  readonly triggerRef: Ref<HTMLElement | null>;
  readonly dialogRef: Ref<HTMLElement | null>;
  readonly firstFocusableRef: Ref<HTMLElement | null>;
  readonly lastFocusableRef: Ref<HTMLElement | null>;
  readonly activeElementId: Ref<string>;
  readonly focusState: ComputedRef<DialogFocusState>;
  openDialog: () => void;
  closeDialog: (reason: DialogCloseReason) => void;
  handleDialogKeydown: (event: KeyboardEvent) => void;
}

export function useDialogFocusTrap(
  focusableIds: ReadonlyArray<string>,
): DialogFocusTrapController {
  const open = ref(false);
  const triggerRef = ref<HTMLElement | null>(null);
  const dialogRef = ref<HTMLElement | null>(null);
  const firstFocusableRef = ref<HTMLElement | null>(null);
  const lastFocusableRef = ref<HTMLElement | null>(null);
  const activeElementId = ref(focusableIds[0] ?? "");

  const focusState = computed<DialogFocusState>(() => ({
    open: open.value,
    triggerId: "open-accessibility-dialog",
    focusableIds,
    activeId: activeElementId.value,
  }));

  function focusElement(target: HTMLElement | null, fallbackId: string): void {
    target?.focus();
    activeElementId.value = target?.id ?? fallbackId;
  }

  function focusElementById(id: string): void {
    focusElement(document.getElementById(id), id);
  }

  function focusFirstDialogControl(): void {
    focusElement(firstFocusableRef.value, focusableIds[0] ?? "");
  }

  function focusLastDialogControl(): void {
    const fallbackId = focusableIds[focusableIds.length - 1] ?? "";
    focusElement(lastFocusableRef.value, fallbackId);
  }

  function openDialog(): void {
    const currentElement = document.activeElement;

    if (currentElement instanceof HTMLElement) {
      triggerRef.value = currentElement;
    }

    open.value = true;
    void nextTick(() => {
      focusFirstDialogControl();
    });
  }

  function closeDialog(reason: DialogCloseReason): void {
    open.value = false;
    activeElementId.value = reason;
    void nextTick(() => {
      focusElement(triggerRef.value, focusState.value.triggerId);
    });
  }

  function handleDialogKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog("escape");
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const currentElement = document.activeElement;

    if (event.shiftKey && currentElement === firstFocusableRef.value) {
      event.preventDefault();
      focusLastDialogControl();
      return;
    }

    if (!event.shiftKey && currentElement === lastFocusableRef.value) {
      event.preventDefault();
      focusFirstDialogControl();
      return;
    }

    event.preventDefault();
    const nextId = getNextDialogFocusId(
      focusState.value,
      event.shiftKey ? "backward" : "forward",
    );
    focusElementById(nextId);
  }

  return {
    open,
    triggerRef,
    dialogRef,
    firstFocusableRef,
    lastFocusableRef,
    activeElementId,
    focusState,
    openDialog,
    closeDialog,
    handleDialogKeydown,
  };
}
