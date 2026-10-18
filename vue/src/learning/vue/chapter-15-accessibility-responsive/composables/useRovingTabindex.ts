import { computed, ref } from "vue";
import {
  getActiveRovingItem,
  getRovingSelectedState,
  getRovingTabIndex,
  moveRovingIndex,
  type RovingItem,
  type RovingTabState,
} from "../models/rovingTabindexModel";

export function useRovingTabindex(items: ReadonlyArray<RovingItem>) {
  const activeIndex = ref(0);
  const state = computed<RovingTabState>(() => ({
    items,
    activeIndex: activeIndex.value,
  }));
  const activeItem = computed(() => getActiveRovingItem(state.value));

  function moveNext(): void {
    activeIndex.value = moveRovingIndex(state.value, "next");
  }

  function movePrevious(): void {
    activeIndex.value = moveRovingIndex(state.value, "previous");
  }

  function moveFirst(): void {
    activeIndex.value = moveRovingIndex(state.value, "first");
  }

  function moveLast(): void {
    activeIndex.value = moveRovingIndex(state.value, "last");
  }

  function getItemTabIndex(itemIndex: number): 0 | -1 {
    return getRovingTabIndex(state.value, itemIndex);
  }

  function getItemSelectedState(itemIndex: number): "true" | "false" {
    return getRovingSelectedState(state.value, itemIndex);
  }

  function handleRovingKeydown(event: KeyboardEvent): boolean {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveNext();
      return true;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      movePrevious();
      return true;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFirst();
      return true;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveLast();
      return true;
    }

    return false;
  }

  return {
    activeIndex,
    activeItem,
    moveNext,
    movePrevious,
    moveFirst,
    moveLast,
    getItemTabIndex,
    getItemSelectedState,
    handleRovingKeydown,
  };
}
