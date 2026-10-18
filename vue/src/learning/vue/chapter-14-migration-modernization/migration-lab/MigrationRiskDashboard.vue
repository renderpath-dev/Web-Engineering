<script setup lang="ts">
import { compatibilityRisks } from "../models/compatibilityRiskModel";
import { optionsToCompositionSteps } from "../models/optionsToCompositionModel";
import { routerMigrationSummaries } from "../models/routerMigrationModel";
import { viteMigrationChecks } from "../models/viteMigrationModel";
import { vuexToPiniaMappings } from "../models/vuexToPiniaMigrationModel";
</script>

<template>
  <section class="dashboard" aria-labelledby="chapter-14-dashboard-title">
    <header class="dashboard-header">
      <p class="card-eyebrow">Risk dashboard</p>
      <h3 id="chapter-14-dashboard-title">Migration evidence map</h3>
    </header>

    <div class="dashboard-grid">
      <article>
        <h4>Compatibility risks</h4>
        <p>{{ compatibilityRisks.length }} tracked risks</p>
      </article>
      <article>
        <h4>Component steps</h4>
        <p>{{ optionsToCompositionSteps.length }} review steps</p>
      </article>
      <article>
        <h4>Router paths</h4>
        <p>{{ routerMigrationSummaries.length }} route checks</p>
      </article>
      <article>
        <h4>Store mappings</h4>
        <p>{{ vuexToPiniaMappings.length }} ownership rules</p>
      </article>
      <article>
        <h4>Build checks</h4>
        <p>{{ viteMigrationChecks.length }} Vite checks</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.dashboard-header h3 {
  margin-bottom: 0;
}

.card-eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
}

article {
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
}

h4,
p {
  margin: 0;
}
</style>
