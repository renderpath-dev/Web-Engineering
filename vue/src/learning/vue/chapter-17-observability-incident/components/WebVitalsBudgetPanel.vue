<script setup lang="ts">
import { computed, ref } from "vue";
import { reviewWebVital, type WebVitalName } from "../models/webVitalsBudgetModel";

const vitalName = ref<WebVitalName>("LCP");
const value = ref(2800);
const review = computed(() => reviewWebVital(vitalName.value, value.value, false));
</script>

<template>
  <section class="observability-card" aria-labelledby="web-vitals-title">
    <h3 id="web-vitals-title">Core Web Vitals budget</h3>
    <label class="observability-field">
      <span>Vital</span>
      <select v-model="vitalName">
        <option value="LCP">LCP</option>
        <option value="CLS">CLS</option>
        <option value="INP">INP</option>
      </select>
    </label>
    <label class="observability-field">
      <span>Value</span>
      <input v-model.number="value" type="number" min="0" step="0.01" />
    </label>
    <p>
      Status:
      <span
        class="observability-badge"
        :class="{ blocked: review.status === 'blocked', warning: review.status === 'warning' }"
      >
        {{ review.status }}
      </span>
    </p>
    <p>Field data: {{ review.fieldData }}</p>
  </section>
</template>
