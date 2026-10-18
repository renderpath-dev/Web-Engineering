<script setup lang="ts">
import { computed, ref } from "vue";

const open = ref(false);
const contentId = "chapter-15-disclosure-content";
const buttonLabel = computed(() =>
  open.value ? "Hide keyboard checklist" : "Show keyboard checklist",
);
</script>

<template>
  <section class="a11y-card" aria-labelledby="disclosure-title">
    <h3 id="disclosure-title">Disclosure interaction</h3>
    <button
      class="a11y-button"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="contentId"
      @click="open = !open"
    >
      {{ buttonLabel }}
    </button>
    <div v-if="open" :id="contentId" class="a11y-status">
      <p>Tab reaches the button once. Enter or Space toggles the content.</p>
    </div>
  </section>
</template>

