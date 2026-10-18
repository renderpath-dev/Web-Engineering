<script setup lang="ts">
import { computed, ref } from "vue";
import {
  createSafeStyle,
  reviewRawStyleString,
  type ColorToken,
  type DensityToken,
} from "../models/safeStyleModel";

const colorToken = ref<ColorToken>("default");
const backgroundToken = ref<ColorToken>("success");
const density = ref<DensityToken>("comfortable");
const rawStyleReview = ref(reviewRawStyleString("color: red"));

const styleReview = computed(() =>
  createSafeStyle({
    colorToken: colorToken.value,
    backgroundToken: backgroundToken.value,
    density: density.value,
  }),
);
</script>

<template>
  <section class="security-card" aria-labelledby="safe-style-title">
    <h3 id="safe-style-title">Style token allowlist</h3>

    <label class="security-field">
      <span>Text color token</span>
      <select v-model="colorToken">
        <option value="default">default</option>
        <option value="success">success</option>
        <option value="warning">warning</option>
      </select>
    </label>

    <label class="security-field">
      <span>Background token</span>
      <select v-model="backgroundToken">
        <option value="default">default</option>
        <option value="success">success</option>
        <option value="warning">warning</option>
      </select>
    </label>

    <label class="security-field">
      <span>Density</span>
      <select v-model="density">
        <option value="comfortable">comfortable</option>
        <option value="compact">compact</option>
      </select>
    </label>

    <p class="security-output" :style="styleReview.style">
      Reviewed style object rendered from tokens.
    </p>
    <p>{{ styleReview.reason }}</p>
    <p>
      Raw style review:
      <span class="security-badge blocked">{{ rawStyleReview.status }}</span>
      {{ rawStyleReview.reason }}
    </p>
  </section>
</template>
