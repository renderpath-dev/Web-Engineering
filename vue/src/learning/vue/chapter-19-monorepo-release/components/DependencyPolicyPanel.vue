<script setup lang="ts">
import { useDependencyPolicy } from "../composables/useDependencyPolicy";
import { dependencyPolicies } from "../models/dependencyPolicyModel";

const { lockfileReviewRequired, reviewRequired, workspaceProtocolRows } = useDependencyPolicy();
</script>

<template>
  <section class="monorepo-card">
    <h3>Dependency and lockfile policy panel</h3>
    <p>Policies: {{ dependencyPolicies.length }}</p>
    <p>Review required: {{ reviewRequired.length }}</p>
    <p>Workspace protocol rows: {{ workspaceProtocolRows.length }}</p>
    <p>Lockfile review: {{ lockfileReviewRequired }}</p>
  </section>
</template>

