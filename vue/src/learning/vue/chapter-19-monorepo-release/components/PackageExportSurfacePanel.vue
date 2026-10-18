<script setup lang="ts">
import {
  canConsumerImportPath,
  hasPublicCssExport,
  hasTypeDeclarationEntry,
  packageExportSurface,
} from "../models/packageExportSurfaceModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Package export surface model</h3>
    <p>CSS export: {{ hasPublicCssExport(packageExportSurface) }}</p>
    <p>Type declarations: {{ hasTypeDeclarationEntry(packageExportSurface) }}</p>
    <p>
      Internal import allowed:
      {{ canConsumerImportPath(packageExportSurface, "./internal/token-resolver") }}
    </p>
  </section>
</template>

