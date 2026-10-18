<script setup lang="ts">
import { findMissingStoryStates } from "../models/documentationStoryModel";

const missingStories = findMissingStoryStates(
  [
    {
      title: "Button primary",
      componentName: "DsButton",
      state: "default",
      args: { variant: "primary" },
      purpose: "Show primary action.",
      antiExample: false,
    },
  ],
  ["default", "disabled", "loading"],
);
</script>

<template>
  <section class="design-card">
    <h3>Documentation stories</h3>
    <p>Missing story states: {{ missingStories.join(", ") }}</p>
    <p>Storybook is a documentation boundary here, not an installed dependency.</p>
  </section>
</template>
