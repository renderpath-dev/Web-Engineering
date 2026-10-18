<script setup lang="ts">
import { findUnsafeCustomizationInputs } from "../models/securityTokenBoundaryModel";

const unsafeInputs = findUnsafeCustomizationInputs([
  { kind: "token", value: "color.action" },
  { kind: "raw-css", value: "position: fixed" },
  { kind: "slot", value: "icon" },
]);
</script>

<template>
  <section class="design-card">
    <h3>Security token boundary</h3>
    <p>Unsafe customization inputs: {{ unsafeInputs.length }}</p>
  </section>
</template>
