<script setup lang="ts">
import {
  explainDuplicateVueRisk,
  isReusableVueLibraryDependencySafe,
  vuePeerDependencyDecision,
} from "../models/peerDependencyModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Peer dependency and external Vue model</h3>
    <p>Dependency: {{ vuePeerDependencyDecision.dependencyName }}</p>
    <p>Safe for reuse: {{ isReusableVueLibraryDependencySafe(vuePeerDependencyDecision) }}</p>
    <p>{{ explainDuplicateVueRisk(vuePeerDependencyDecision) }}</p>
  </section>
</template>

