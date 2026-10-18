<script setup lang="ts">
import { useReleaseCandidateGate } from "../composables/useReleaseCandidateGate";

const { approveReviewerGate, gateResult, reviewerOverride } = useReleaseCandidateGate();
</script>

<template>
  <section class="monorepo-card monorepo-dashboard">
    <h3>Monorepo release dashboard</h3>
    <p>Release blocked: {{ gateResult.blocked }}</p>
    <p>Failure signals: {{ gateResult.failureSignals.join(", ") }}</p>
    <p>Reviewer override: {{ reviewerOverride }}</p>
    <button type="button" class="monorepo-button" @click="approveReviewerGate">
      Mark reviewer evidence
    </button>
  </section>
</template>

