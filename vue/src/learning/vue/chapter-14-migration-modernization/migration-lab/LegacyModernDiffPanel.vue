<script setup lang="ts">
import LegacyMixinUsage from "../legacy-shaped/LegacyMixinUsage.vue";
import LegacyOptionsProfile from "../legacy-shaped/LegacyOptionsProfile.vue";
import ModernProfileComposition from "../modernized/ModernProfileComposition.vue";
import ProfileEventContract from "../modernized/ProfileEventContract.vue";
</script>

<template>
  <section class="diff-panel" aria-labelledby="legacy-modern-diff-title">
    <header class="panel-header">
      <p class="card-eyebrow">Legacy to modern</p>
      <h3 id="legacy-modern-diff-title">Behavior first, syntax second</h3>
      <p>
        The legacy-shaped examples run inside Vue 3 so the lab can teach
        migration without installing legacy runtime dependencies.
      </p>
    </header>
    <div class="diff-grid">
      <LegacyOptionsProfile />
      <ModernProfileComposition />
      <LegacyMixinUsage />
      <ProfileEventContract />
    </div>
  </section>
</template>

<style scoped>
.diff-panel {
  display: grid;
  gap: 1rem;
}

.panel-header {
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.card-eyebrow {
  margin: 0;
  color: #7c3aed;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
</style>
