<script setup lang="ts">
import { reviewNavigationTiming } from "../models/navigationTimingModel";

const review = reviewNavigationTiming({
  navigationType: "reload",
  startTime: 0,
  domInteractive: 740,
  loadEventEnd: 1320,
});
</script>

<template>
  <section class="observability-card" aria-labelledby="navigation-timing-title">
    <h3 id="navigation-timing-title">Navigation Timing review</h3>
    <p>Type: {{ review.navigationType }}</p>
    <p>Interactive: {{ review.interactiveMs }}ms</p>
    <p>
      Complete:
      <span class="observability-badge">{{ review.completeMs }}ms</span>
    </p>
  </section>
</template>
