<script setup lang="ts">
import { reviewMeasureDuration } from "../models/performanceMarkModel";

const review = reviewMeasureDuration("chapter-17:panel:measure", 148);
</script>

<template>
  <section class="observability-card" aria-labelledby="performance-marks-title">
    <h3 id="performance-marks-title">User Timing review</h3>
    <p class="observability-output">{{ review.name }}</p>
    <p>
      Duration:
      <span class="observability-badge" :class="{ warning: review.status === 'warning' }">
        {{ review.durationMs }}ms / {{ review.status }}
      </span>
    </p>
  </section>
</template>
