<script setup lang="ts">
import { isLibraryPackageBoundary, packageBoundaries } from "../models/packageBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Package boundary panel</h3>
    <ul class="monorepo-list">
      <li v-for="boundary in packageBoundaries" :key="boundary.packageName">
        <span>{{ boundary.packageName }}</span>
        <span>{{ boundary.buildGoal }}</span>
        <span>Library: {{ isLibraryPackageBoundary(boundary) }}</span>
      </li>
    </ul>
  </section>
</template>

