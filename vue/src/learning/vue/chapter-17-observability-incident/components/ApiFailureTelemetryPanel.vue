<script setup lang="ts">
import { computed, ref } from "vue";
import { createApiFailureSignal } from "../models/apiFailureTelemetryModel";

const status = ref(503);
const signal = computed(() =>
  createApiFailureSignal({
    endpointPath: "/api/orders?account=redacted",
    status: status.value === 0 ? null : status.value,
    requestId: "request-local-17",
  }),
);
</script>

<template>
  <section class="observability-card" aria-labelledby="api-failure-title">
    <h3 id="api-failure-title">API failure telemetry</h3>
    <label class="observability-field">
      <span>Status</span>
      <select v-model.number="status">
        <option :value="0">network</option>
        <option :value="404">404</option>
        <option :value="503">503</option>
      </select>
    </label>
    <p class="observability-output">{{ signal.safeMessage }}</p>
    <p>Retry: {{ signal.retryDecision }}</p>
  </section>
</template>
