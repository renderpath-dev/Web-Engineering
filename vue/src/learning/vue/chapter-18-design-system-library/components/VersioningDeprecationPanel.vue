<script setup lang="ts">
import { isDeprecationPlanComplete } from "../models/deprecationModel";
import { getSemverImpact } from "../models/versioningModel";

const semverImpact = getSemverImpact({
  changeType: "removed-prop",
  migrationNote: "Use tone instead of colorIntent.",
});
const deprecationComplete = isDeprecationPlanComplete({
  propName: "colorIntent",
  replacement: "tone",
  firstDeprecatedVersion: "1.4.0",
  plannedRemovalVersion: "2.0.0",
});
</script>

<template>
  <section class="design-card">
    <h3>Versioning and deprecation</h3>
    <p>Impact: {{ semverImpact }}</p>
    <p>Deprecation plan complete: {{ deprecationComplete }}</p>
  </section>
</template>
