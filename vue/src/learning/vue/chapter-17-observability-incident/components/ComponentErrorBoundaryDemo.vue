<script setup lang="ts">
import { useVueErrorBoundary } from "../composables/useVueErrorBoundary";

const { captureError, fallbackState, propagationRequired, resetBoundary } =
  useVueErrorBoundary();

function simulateComponentFailure(): void {
  captureError(new Error("Chart widget failed"), true);
}
</script>

<template>
  <section class="observability-card" aria-labelledby="component-boundary-title">
    <h3 id="component-boundary-title">Component error boundary demo</h3>
    <p>
      This button updates a local fallback model. It does not crash the live app.
    </p>

    <div class="observability-actions">
      <button class="observability-button" type="button" @click="simulateComponentFailure">
        Simulate boundary state
      </button>
      <button class="observability-button secondary" type="button" @click="resetBoundary">
        Reset
      </button>
    </div>

    <p v-if="fallbackState.hasError" class="observability-output">
      {{ fallbackState.message }}
    </p>
    <p>
      Propagation required:
      <span class="observability-badge">{{ propagationRequired }}</span>
    </p>
  </section>
</template>
