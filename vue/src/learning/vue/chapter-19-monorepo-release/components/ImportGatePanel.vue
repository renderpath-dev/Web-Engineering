<script setup lang="ts">
import {
  designSystemImportPolicy,
  isImportPathAllowed,
  listBlockedImportSignals,
} from "../models/importGateModel";

const checkedPaths = [".", "./css", "./internal/token-resolver"];
const blockedPaths = listBlockedImportSignals(designSystemImportPolicy, checkedPaths);
</script>

<template>
  <section class="monorepo-card">
    <h3>Internal package import gate</h3>
    <p>Blocked paths: {{ blockedPaths.join(", ") }}</p>
    <ul class="monorepo-list">
      <li v-for="pathValue in checkedPaths" :key="pathValue">
        <span>{{ pathValue }}</span>
        <span>Allowed: {{ isImportPathAllowed(designSystemImportPolicy, pathValue) }}</span>
      </li>
    </ul>
  </section>
</template>

