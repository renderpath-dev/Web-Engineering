<script setup lang="ts">
import { legacyWebpackEnvReads } from "../legacy-shaped/legacyWebpackEnvModel";
import { readViteEnvBoundary } from "../modernized/viteEnvBoundary";

const viteEnv = readViteEnvBoundary();
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">Build tooling</p>
    <h3>Vue CLI and webpack assumptions to Vite</h3>
    <p>Mode: {{ viteEnv.mode }}</p>
    <p>Production: {{ viteEnv.isProduction }}</p>
    <p>API base URL: {{ viteEnv.apiBaseUrl }}</p>
    <ul>
      <li v-for="read in legacyWebpackEnvReads" :key="read.expression">
        <strong>{{ read.expression }}</strong>
        <span>{{ read.migrationRisk }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.lab-card {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.card-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

ul {
  display: grid;
  gap: 0.6rem;
  padding-left: 1.2rem;
}

li {
  display: grid;
}
</style>
