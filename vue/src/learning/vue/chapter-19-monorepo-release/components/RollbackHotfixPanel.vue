<script setup lang="ts">
import {
  getRollbackBlockingReason,
  isRollbackPathReady,
  rollbackHotfixDecision,
} from "../models/rollbackHotfixModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Rollback and hotfix decision panel</h3>
    <p>Affected package: {{ rollbackHotfixDecision.affectedPackage }}</p>
    <p>Affected consumer: {{ rollbackHotfixDecision.affectedConsumer }}</p>
    <p>Ready: {{ isRollbackPathReady(rollbackHotfixDecision) }}</p>
    <p>{{ getRollbackBlockingReason(rollbackHotfixDecision) }}</p>
  </section>
</template>

