import { nextTick, ref, type Ref } from "vue";

export interface FocusRestoreController {
  readonly targetRef: Ref<HTMLElement | null>;
  readonly lastFocusedId: Ref<string>;
  restoreFocus: (reason: string) => Promise<void>;
}

export function useFocusRestore(targetId: string): FocusRestoreController {
  const targetRef = ref<HTMLElement | null>(null);
  const lastFocusedId = ref("");

  async function restoreFocus(reason: string): Promise<void> {
    await nextTick();
    targetRef.value?.focus();
    lastFocusedId.value = `${targetId}:${reason}`;
  }

  return {
    targetRef,
    lastFocusedId,
    restoreFocus,
  };
}

