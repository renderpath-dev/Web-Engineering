<script setup lang="ts">
import { reviewReleaseHealth } from "../models/releaseHealthModel";

const review = reviewReleaseHealth({
  errorRatePercent: 1.4,
  failedApiRatePercent: 1.2,
  blockedVitalCount: 0,
  openIncidentCount: 0,
});
</script>

<template>
  <section class="observability-card" aria-labelledby="release-health-title">
    <h3 id="release-health-title">Release health dashboard</h3>
    <p>
      Release allowed:
      <span class="observability-badge" :class="{ blocked: !review.releaseAllowed }">
        {{ review.releaseAllowed }}
      </span>
    </p>
    <p>{{ review.reason }}</p>
  </section>
</template>
