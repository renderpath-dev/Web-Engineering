<script setup lang="ts">
import { computed, ref } from "vue";
import {
  createRouteNavigationSignal,
  isSlowNavigation,
} from "../models/routeTelemetryModel";

const durationMs = ref(920);
const signal = computed(() =>
  createRouteNavigationSignal({
    routeName: "orders-detail",
    fullPath: "/orders/preview?customer=redacted",
    durationMs: durationMs.value,
    failureReason: "none",
    taskContext: "order-review",
  }),
);
</script>

<template>
  <section class="observability-card" aria-labelledby="route-telemetry-title">
    <h3 id="route-telemetry-title">Route navigation telemetry</h3>
    <label class="observability-field">
      <span>Duration</span>
      <input v-model.number="durationMs" type="number" min="0" />
    </label>
    <p class="observability-output">{{ signal.redactedPath }}</p>
    <p>
      Slow:
      <span class="observability-badge" :class="{ warning: isSlowNavigation(signal) }">
        {{ isSlowNavigation(signal) }}
      </span>
    </p>
  </section>
</template>
