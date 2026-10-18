<script setup lang="ts">
import { isMigrationNoteComplete, migrationNote } from "../models/migrationNoteModel";
import {
  doesVersionPlanMatchImpact,
  inferSemverImpact,
  versionPlan,
} from "../models/versionPlanModel";

const inferredImpact = inferSemverImpact({
  removedExport: true,
  addedExport: false,
  behaviorChanged: false,
});
</script>

<template>
  <section class="monorepo-card">
    <h3>Version plan and migration-note panel</h3>
    <p>Version plan: {{ versionPlan.currentVersion }} -> {{ versionPlan.nextVersion }}</p>
    <p>Impact match: {{ doesVersionPlanMatchImpact(versionPlan, inferredImpact) }}</p>
    <p>Migration note ready: {{ isMigrationNoteComplete(migrationNote) }}</p>
  </section>
</template>

