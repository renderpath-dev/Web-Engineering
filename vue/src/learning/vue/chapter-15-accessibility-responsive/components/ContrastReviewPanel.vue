<script setup lang="ts">
import { contrastPairs, passesContrast } from "../models/contrastModel";
</script>

<template>
  <section class="a11y-card" aria-labelledby="contrast-review-title">
    <h3 id="contrast-review-title">Contrast review model</h3>
    <ul>
      <li v-for="pair in contrastPairs" :key="pair.id">
        <strong>{{ pair.id }}</strong>
        ratio {{ pair.ratio }} against target {{ pair.target }}:
        {{ passesContrast(pair) ? "reviewed" : "blocked" }}
      </li>
    </ul>
  </section>
</template>

