<script setup lang="ts">
import {
  findMissingRequiredScripts,
  shouldRunSequentially,
  workspaceScripts,
} from "../models/workspaceScriptModel";

const packageNames = ["@vue-lab/design-system", "@vue-lab/admin-app"];
const missingTestScripts = findMissingRequiredScripts(workspaceScripts, packageNames, "test");
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace script orchestration panel</h3>
    <p>Missing required test scripts: {{ missingTestScripts.join(", ") || "none" }}</p>
    <p>Build should be sequential: {{ shouldRunSequentially("build") }}</p>
  </section>
</template>

