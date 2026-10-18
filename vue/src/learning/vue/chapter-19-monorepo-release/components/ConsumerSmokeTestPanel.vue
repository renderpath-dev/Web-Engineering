<script setup lang="ts">
import {
  consumerSmokeResult,
  isConsumerSmokeReady,
  listMissingConsumerSmokeEvidence,
} from "../models/consumerSmokeTestModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Consumer app smoke-test model</h3>
    <p>{{ consumerSmokeResult.consumerPackage }} consumes {{ consumerSmokeResult.libraryPackage }}</p>
    <p>Ready: {{ isConsumerSmokeReady(consumerSmokeResult) }}</p>
    <p>Missing: {{ listMissingConsumerSmokeEvidence(consumerSmokeResult).join(", ") }}</p>
  </section>
</template>

