<script setup lang="ts">
import BuildToolMigrationPanel from "./migration-lab/BuildToolMigrationPanel.vue";
import LegacyModernDiffPanel from "./migration-lab/LegacyModernDiffPanel.vue";
import MigrationInventoryPanel from "./migration-lab/MigrationInventoryPanel.vue";
import MigrationRiskDashboard from "./migration-lab/MigrationRiskDashboard.vue";
import RollbackPlanPanel from "./migration-lab/RollbackPlanPanel.vue";
import RouterMigrationPanel from "./migration-lab/RouterMigrationPanel.vue";
import StoreMigrationPanel from "./migration-lab/StoreMigrationPanel.vue";
import TestSafetyNetPanel from "./migration-lab/TestSafetyNetPanel.vue";
</script>

<template>
  <section class="chapter-section" aria-labelledby="chapter-14-title">
    <header class="chapter-header">
      <p class="eyebrow">Chapter 14</p>
      <h2 id="chapter-14-title">
        Migration, Modernization, Legacy Refactoring, and Architecture Evolution
      </h2>
      <p>
        Practice migration as behavior preservation plus small ownership moves:
        inventory first, safety net second, refactor third, rollback always
        visible.
      </p>
    </header>

    <MigrationRiskDashboard />
    <MigrationInventoryPanel />
    <LegacyModernDiffPanel />

    <div class="chapter-grid">
      <RouterMigrationPanel />
      <StoreMigrationPanel />
      <BuildToolMigrationPanel />
      <TestSafetyNetPanel />
      <RollbackPlanPanel />
    </div>
  </section>
</template>

<style scoped>
.chapter-section {
  display: grid;
  gap: 1rem;
}

.chapter-header {
  padding: 1.25rem;
  border: 1px solid #d8e4de;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 1rem 2.5rem rgba(33, 53, 71, 0.06);
}

.chapter-header h2 {
  max-width: 900px;
  margin: 0.35rem 0 0.75rem;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 1.12;
}

.chapter-header p {
  max-width: 820px;
  line-height: 1.7;
}

.eyebrow {
  margin: 0;
  color: #18794e;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
</style>
