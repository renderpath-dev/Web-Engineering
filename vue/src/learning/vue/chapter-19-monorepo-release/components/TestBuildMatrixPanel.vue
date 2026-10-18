<script setup lang="ts">
import { useCiEvidenceMatrix } from "../composables/useCiEvidenceMatrix";

const { blocked, passCount, rows, unknownCount } = useCiEvidenceMatrix();
</script>

<template>
  <section class="monorepo-card">
    <h3>Test and build matrix dashboard</h3>
    <p>Release blocked: {{ blocked }}</p>
    <p>Pass: {{ passCount }} | Unknown: {{ unknownCount }}</p>
    <ul class="monorepo-list">
      <li v-for="row in rows" :key="`${row.packageName}-${row.checkName}`">
        <span>{{ row.packageName }}</span>
        <span>{{ row.checkName }}</span>
        <span>{{ row.status }}</span>
      </li>
    </ul>
  </section>
</template>

