<script setup lang="ts">
import { computed, ref } from "vue";
import {
  reviewPrivacySink,
  type DataClassification,
  type DataSink,
} from "../models/privacyDataClassificationModel";

const classification = ref<DataClassification>("personal");
const sink = ref<DataSink>("url");

const review = computed(() =>
  reviewPrivacySink({
    label: "profile-email",
    classification: classification.value,
    sink: sink.value,
  }),
);
</script>

<template>
  <section class="security-card" aria-labelledby="privacy-data-title">
    <h3 id="privacy-data-title">Privacy data classification</h3>

    <label class="security-field">
      <span>Classification</span>
      <select v-model="classification">
        <option value="public">public</option>
        <option value="internal">internal</option>
        <option value="personal">personal</option>
        <option value="secret">secret</option>
      </select>
    </label>

    <label class="security-field">
      <span>Sink</span>
      <select v-model="sink">
        <option value="screen">screen</option>
        <option value="url">url</option>
        <option value="log">log</option>
        <option value="local-storage">local-storage</option>
        <option value="analytics">analytics</option>
        <option value="error-report">error-report</option>
      </select>
    </label>

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
