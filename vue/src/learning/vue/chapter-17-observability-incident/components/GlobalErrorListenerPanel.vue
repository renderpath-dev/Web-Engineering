<script setup lang="ts">
import { normalizeGlobalErrorSignal } from "../models/globalErrorModel";

const signals = [
  normalizeGlobalErrorSignal({
    kind: "window-error",
    message: "Synchronous handler failed",
    source: "browser-window",
  }),
  normalizeGlobalErrorSignal({
    kind: "unhandled-rejection",
    reason: new Error("Async operation rejected"),
    source: "promise",
  }),
];
</script>

<template>
  <section class="observability-card" aria-labelledby="global-error-title">
    <h3 id="global-error-title">Global browser error signals</h3>
    <ul class="observability-list">
      <li v-for="signal in signals" :key="signal.kind">
        <h4>{{ signal.kind }}</h4>
        <p>{{ signal.message }}</p>
        <p>User visible: {{ signal.userVisible }}</p>
      </li>
    </ul>
  </section>
</template>
