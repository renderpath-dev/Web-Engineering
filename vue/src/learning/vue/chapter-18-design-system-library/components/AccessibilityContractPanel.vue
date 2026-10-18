<script setup lang="ts">
import { findMissingAccessibilityEvidence } from "../models/accessibilityContractModel";

const missingEvidence = findMissingAccessibilityEvidence({
  componentName: "DsTextField",
  requirements: ["name", "description", "state", "keyboard"],
  verifiedRequirements: ["name", "description"],
});
</script>

<template>
  <section class="design-card">
    <h3>Accessibility contract</h3>
    <p>Missing evidence: {{ missingEvidence.join(", ") }}</p>
  </section>
</template>
