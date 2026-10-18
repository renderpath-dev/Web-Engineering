<script setup lang="ts">
import { computed, ref } from "vue";
import {
  reviewEnvExposure,
  type EnvExposureInput,
} from "../models/envExposureModel";

const key = ref("VITE_PUBLIC_LABEL");
const valueClassification = ref<EnvExposureInput["valueClassification"]>("public");

const review = computed(() =>
  reviewEnvExposure({
    key: key.value,
    valueClassification: valueClassification.value,
  }),
);
</script>

<template>
  <section class="security-card" aria-labelledby="env-exposure-title">
    <h3 id="env-exposure-title">Vite env exposure review</h3>

    <label class="security-field">
      <span>Env key</span>
      <input v-model="key" />
    </label>

    <label class="security-field">
      <span>Value classification</span>
      <select v-model="valueClassification">
        <option value="public">public</option>
        <option value="internal">internal</option>
        <option value="secret">secret</option>
      </select>
    </label>

    <p>
      Exposed to client:
      <span class="security-badge">{{ review.exposedToClient }}</span>
    </p>
    <p>
      Status:
      <span
        class="security-badge"
        :class="{
          blocked: review.status === 'blocked',
          review: review.status === 'requires-review',
        }"
      >
        {{ review.status }}
      </span>
    </p>
    <p>{{ review.reason }}</p>
  </section>
</template>
