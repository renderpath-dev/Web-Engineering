<script setup lang="ts">
import { createComponentFallbackState } from "../models/vueErrorBoundaryModel";

const fallback = createComponentFallbackState({
  message: "A local widget fallback is visible.",
  reportCreated: true,
  stopPropagation: false,
});
</script>

<template>
  <section class="observability-card" aria-labelledby="error-fallback-title">
    <h3 id="error-fallback-title">Fallback and report separation</h3>
    <p class="observability-output">{{ fallback.message }}</p>
    <p>
      Report created:
      <span class="observability-badge">{{ fallback.reportCreated }}</span>
    </p>
    <p>
      Propagation:
      <span class="observability-badge warning">{{ fallback.propagation }}</span>
    </p>
  </section>
</template>
