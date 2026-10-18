<script setup lang="ts">
import { useDesignSystemReleaseGate } from "../composables/useDesignSystemReleaseGate";

const { gate, blocked, setTestsPassing } = useDesignSystemReleaseGate({
  tokenDocsComplete: true,
  testsPassing: false,
  accessibilityEvidenceComplete: true,
  securityReviewComplete: true,
  packageBoundaryDocumented: true,
  issues: [
    {
      id: "DS-18-1",
      title: "Missing type declaration evidence",
      severity: "high",
      open: true,
    },
  ],
});
</script>

<template>
  <section class="design-card">
    <h3>Design system release dashboard</h3>
    <p>Release blocked: {{ blocked }}</p>
    <p>Open issues: {{ gate.issues.length }}</p>
    <button type="button" class="design-button" @click="setTestsPassing(true)">
      Mark local tests passing
    </button>
  </section>
</template>
