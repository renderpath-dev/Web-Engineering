<script setup lang="ts">
import { computed, ref } from "vue";
import { useResponsiveViewport } from "../composables/useResponsiveViewport";

const expanded = ref(false);
const { width, result } = useResponsiveViewport();
const navigationLabel = computed(() =>
  expanded.value ? "Close chapter navigation" : "Open chapter navigation",
);
</script>

<template>
  <section class="a11y-card" aria-labelledby="responsive-nav-title">
    <h3 id="responsive-nav-title">Responsive navigation</h3>
    <button
      class="a11y-button"
      type="button"
      aria-controls="chapter-15-responsive-nav"
      :aria-expanded="expanded ? 'true' : 'false'"
      @click="expanded = !expanded"
    >
      {{ navigationLabel }}
    </button>
    <nav
      v-if="expanded"
      id="chapter-15-responsive-nav"
      class="a11y-nav"
      aria-label="Responsive chapter links"
    >
      <a href="#chapter-15-main">Main demo</a>
      <a href="#chapter-15-verification">Verification</a>
      <a href="#chapter-15-footer">Completion</a>
    </nav>
    <p class="a11y-status">
      Width {{ width }}px, viewport status {{ result.status }}.
    </p>
  </section>
</template>

