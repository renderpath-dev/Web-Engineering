<script setup lang="ts">
import {
  canTypeScriptProveRuntimeRender,
  isDeclarationBoundaryReady,
  typeScriptProjectBoundaries,
} from "../models/typescriptProjectBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>TypeScript project boundary panel</h3>
    <ul class="monorepo-list">
      <li v-for="boundary in typeScriptProjectBoundaries" :key="boundary.packageName">
        <span>{{ boundary.packageName }}</span>
        <span>Declarations: {{ isDeclarationBoundaryReady(boundary) }}</span>
        <span>Runtime proof: {{ canTypeScriptProveRuntimeRender(boundary) }}</span>
      </li>
    </ul>
  </section>
</template>

