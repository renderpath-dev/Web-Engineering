<script setup lang="ts">
import { ciPipelineChecks, listBlockingCiChecks } from "../models/ciPipelineEvidenceModel";

const blockingChecks = listBlockingCiChecks(ciPipelineChecks);
</script>

<template>
  <section class="monorepo-card">
    <h3>CI pipeline evidence panel</h3>
    <p>Blocking CI checks: {{ blockingChecks.length }}</p>
    <ul class="monorepo-list">
      <li v-for="check in ciPipelineChecks" :key="`${check.packageName}-${check.stage}`">
        <span>{{ check.packageName }}</span>
        <span>{{ check.stage }}</span>
        <span>{{ check.status }}</span>
      </li>
    </ul>
  </section>
</template>

