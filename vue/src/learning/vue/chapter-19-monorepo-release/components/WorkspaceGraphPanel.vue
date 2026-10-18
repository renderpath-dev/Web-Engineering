<script setup lang="ts">
import { useWorkspaceGraph } from "../composables/useWorkspaceGraph";

const { appCount, libraryCount, graphRows } = useWorkspaceGraph();
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace graph overview</h3>
    <p>Apps: {{ appCount }} | Libraries: {{ libraryCount }}</p>
    <ul class="monorepo-list">
      <li v-for="row in graphRows" :key="row.packageName">
        <span>{{ row.packageName }}</span>
        <span>{{ row.owner }}</span>
        <span>{{ row.dependencies }}</span>
      </li>
    </ul>
  </section>
</template>

