<script setup lang="ts">
import { computed, ref } from "vue";
import { reviewSourceMapBoundary } from "../models/sourceMapBoundaryModel";

const sourceMapEnabled = ref(true);
const publicAsset = ref(false);
const releaseIdPresent = ref(true);
const review = computed(() =>
  reviewSourceMapBoundary({
    sourceMapEnabled: sourceMapEnabled.value,
    publicAsset: publicAsset.value,
    releaseIdPresent: releaseIdPresent.value,
  }),
);
</script>

<template>
  <section class="observability-card" aria-labelledby="source-map-title">
    <h3 id="source-map-title">Source map boundary</h3>
    <p>
      Decision:
      <span class="observability-badge warning">{{ review.decision }}</span>
    </p>
    <p>{{ review.reason }}</p>
  </section>
</template>
