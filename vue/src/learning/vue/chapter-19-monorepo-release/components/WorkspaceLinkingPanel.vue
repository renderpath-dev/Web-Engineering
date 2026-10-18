<script setup lang="ts">
import {
  getWorkspaceLinkProofScope,
  requiresInstallEvidenceReview,
  workspaceLinks,
} from "../models/workspaceLinkingModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace linking model</h3>
    <ul class="monorepo-list">
      <li v-for="link in workspaceLinks" :key="`${link.sourcePackage}-${link.targetPackage}`">
        <span>{{ link.sourcePackage }} -> {{ link.targetPackage }}</span>
        <span>{{ getWorkspaceLinkProofScope(link) }}</span>
        <span>Review: {{ requiresInstallEvidenceReview(link) }}</span>
      </li>
    </ul>
  </section>
</template>

