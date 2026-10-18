<script setup lang="ts">
import { computed, ref } from "vue";
import { shouldSampleTelemetryEvent } from "../models/telemetrySamplingModel";
import { createTelemetryEvent } from "../models/telemetryEventModel";

const sequenceNumber = ref(1);
const event = createTelemetryEvent({
  eventName: "panel-opened",
  source: "performance",
  severity: "info",
  routeName: "chapter-17",
  releaseId: "release-17-local",
});
const decision = computed(() =>
  shouldSampleTelemetryEvent(event, 0.25, sequenceNumber.value),
);
</script>

<template>
  <section class="observability-card" aria-labelledby="sampling-title">
    <h3 id="sampling-title">Sampling and rate limit</h3>
    <label class="observability-field">
      <span>Sequence</span>
      <input v-model.number="sequenceNumber" type="number" min="1" />
    </label>
    <p>
      Keep:
      <span class="observability-badge" :class="{ warning: !decision.keep }">
        {{ decision.keep }}
      </span>
    </p>
    <p>{{ decision.reason }}</p>
  </section>
</template>
