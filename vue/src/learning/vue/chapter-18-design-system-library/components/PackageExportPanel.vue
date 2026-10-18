<script setup lang="ts">
import {
  hasCssExport,
  isPublicPackageImport,
  packageExportEntries,
} from "../models/packageExportModel";

const rootImportAllowed = isPublicPackageImport(packageExportEntries, ".");
const internalImportAllowed = isPublicPackageImport(
  packageExportEntries,
  "./internal/tokenResolver",
);
const cssExportPresent = hasCssExport(packageExportEntries);
</script>

<template>
  <section class="design-card">
    <h3>Package export surface</h3>
    <p>Root import allowed: {{ rootImportAllowed }}</p>
    <p>Internal import allowed: {{ internalImportAllowed }}</p>
    <p>CSS export present: {{ cssExportPresent }}</p>
  </section>
</template>
