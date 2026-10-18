<script setup lang="ts">
import { reviewResourceTiming } from "../models/resourceTimingModel";

const review = reviewResourceTiming({
  name: "/assets/chapter-17.js?cache=redacted",
  initiatorType: "script",
  startTime: 10,
  responseEnd: 780,
  crossOriginLimited: false,
});
</script>

<template>
  <section class="observability-card" aria-labelledby="resource-timing-title">
    <h3 id="resource-timing-title">Resource Timing review</h3>
    <p class="observability-output">{{ review.resourceLabel }}</p>
    <p>
      Duration:
      <span class="observability-badge warning">{{ review.durationMs }}ms</span>
    </p>
    <p>Cross-origin limited: {{ review.crossOriginLimited }}</p>
  </section>
</template>
