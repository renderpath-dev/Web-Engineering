<script setup lang="ts">
import {
  cssExportContract,
  isCssExportReady,
  listCssContractFailures,
} from "../models/cssExportContractModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>CSS export and style contract panel</h3>
    <p>CSS entry: {{ cssExportContract.cssEntry }}</p>
    <p>Ready: {{ isCssExportReady(cssExportContract) }}</p>
    <p>Failures: {{ listCssContractFailures(cssExportContract).join(", ") || "none" }}</p>
  </section>
</template>

