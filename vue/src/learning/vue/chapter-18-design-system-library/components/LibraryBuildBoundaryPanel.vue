<script setup lang="ts">
import { evaluateLibraryBuildBoundary } from "../models/libraryBuildBoundaryModel";
import { shouldUseCustomElement } from "../models/customElementBoundaryModel";

const libraryFailures = evaluateLibraryBuildBoundary({
  hasLibraryEntry: true,
  externalVue: true,
  hasCssExport: true,
  hasTypeDeclarations: false,
});
const customElementNeeded = shouldUseCustomElement({
  consumer: "vue-consumer",
  needsShadowDom: false,
  needsVueSlots: true,
});
</script>

<template>
  <section class="design-card">
    <h3>Library build boundary</h3>
    <p>Library model failures: {{ libraryFailures.join(", ") }}</p>
    <p>Custom element needed: {{ customElementNeeded }}</p>
  </section>
</template>
