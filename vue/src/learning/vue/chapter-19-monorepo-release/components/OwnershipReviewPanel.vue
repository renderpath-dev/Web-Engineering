<script setup lang="ts">
import {
  isOwnershipApproved,
  listMissingOwnerApprovals,
  ownershipReviewRules,
} from "../models/ownershipReviewModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace ownership and review panel</h3>
    <p>Ownership approved: {{ isOwnershipApproved(ownershipReviewRules) }}</p>
    <p>Missing approvals: {{ listMissingOwnerApprovals(ownershipReviewRules).length }}</p>
  </section>
</template>

