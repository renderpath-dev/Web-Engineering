<script setup lang="ts">
import { useComponentStateMatrix } from "../composables/useComponentStateMatrix";

const { coverage, missingStates, addState } = useComponentStateMatrix({
  componentName: "DsButton",
  states: ["default", "focus", "disabled", "loading"],
});
</script>

<template>
  <section class="design-card">
    <h3>Component state matrix</h3>
    <p>{{ coverage.componentName }} missing states: {{ missingStates.join(", ") }}</p>
    <button type="button" class="design-button" @click="addState('error')">
      Add error state
    </button>
  </section>
</template>
