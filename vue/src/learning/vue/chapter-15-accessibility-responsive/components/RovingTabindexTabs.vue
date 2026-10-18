<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useRovingTabindex } from "../composables/useRovingTabindex";
import type { RovingItem } from "../models/rovingTabindexModel";

const tabs: ReadonlyArray<RovingItem> = [
  { id: "semantic-html", label: "Semantic HTML" },
  { id: "focus-order", label: "Focus order" },
  { id: "responsive-check", label: "Responsive check" },
];

const {
  activeIndex,
  activeItem,
  getItemTabIndex,
  getItemSelectedState,
  handleRovingKeydown,
} = useRovingTabindex(tabs);
const panelId = computed(() => `${activeItem.value.id}-panel`);
const tabRefs = ref<Array<HTMLElement | null>>([]);

function setTabRef(element: Element | null, index: number): void {
  tabRefs.value[index] = element instanceof HTMLElement ? element : null;
}

function focusActiveTab(): void {
  void nextTick(() => {
    tabRefs.value[activeIndex.value]?.focus();
  });
}

function handleTabKeydown(event: KeyboardEvent): void {
  if (handleRovingKeydown(event)) {
    focusActiveTab();
  }
}
</script>

<template>
  <section class="a11y-card" aria-labelledby="roving-tabs-title">
    <h3 id="roving-tabs-title">Roving tabindex tabs</h3>
    <div class="a11y-tabs" role="tablist" aria-label="Accessibility topics">
      <button
        v-for="(tab, index) in tabs"
        :id="`${tab.id}-tab`"
        :key="tab.id"
        :ref="(element) => setTabRef(element, index)"
        class="a11y-button secondary"
        type="button"
        role="tab"
        :aria-selected="getItemSelectedState(index)"
        :aria-controls="`${tab.id}-panel`"
        :tabindex="getItemTabIndex(index)"
        @keydown="handleTabKeydown"
        @click="activeIndex = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <section
      :id="panelId"
      class="a11y-tab-panel"
      role="tabpanel"
      :aria-labelledby="`${activeItem.id}-tab`"
    >
      Active topic: {{ activeItem.label }}
    </section>
  </section>
</template>
