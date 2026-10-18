<script setup lang="ts">
import { createSkipLinkTarget } from "../models/landmarkModel";

const mainTarget = "chapter-15-main";
</script>

<template>
  <section class="a11y-card" aria-labelledby="skip-link-demo-title">
    <a class="a11y-skip-link" :href="createSkipLinkTarget(mainTarget)">
      Skip to main content
    </a>
    <h3 id="skip-link-demo-title">Skip link demo</h3>
    <p>
      The first focusable control lets keyboard users bypass repeated navigation
      and move to the stable main target.
    </p>
  </section>
</template>

