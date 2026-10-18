<script setup lang="ts">
import { useAffectedPackageSet } from "../composables/useAffectedPackageSet";
import { buildGraphEdges, buildPackages, createBuildOrder } from "../models/buildOrderModel";

const buildOrder = createBuildOrder(buildPackages, buildGraphEdges);
const { affectedPackageNames, changedPackageName, setChangedPackage } = useAffectedPackageSet();
</script>

<template>
  <section class="monorepo-card">
    <h3>Build order and affected package model</h3>
    <p>Build order: {{ buildOrder.join(" -> ") }}</p>
    <p>Changed: {{ changedPackageName }}</p>
    <p>Affected: {{ affectedPackageNames.join(", ") }}</p>
    <button type="button" class="monorepo-button" @click="setChangedPackage('@vue-lab/admin-app')">
      Select app change
    </button>
  </section>
</template>

