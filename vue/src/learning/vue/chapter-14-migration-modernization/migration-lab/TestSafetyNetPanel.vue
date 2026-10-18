<script setup lang="ts">
import { testSafetyNetItems } from "../models/testSafetyNetModel";
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">Tests</p>
    <h3>Safety net before refactor</h3>
    <ul>
      <li v-for="item in testSafetyNetItems" :key="item.target">
        <strong>{{ item.target }}</strong>
        <span>{{ item.behaviorUnderTest }}</span>
        <span>{{ item.testFile }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.lab-card {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.card-eyebrow {
  margin: 0;
  color: #9333ea;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

ul {
  display: grid;
  gap: 0.6rem;
  padding-left: 1.2rem;
}

li {
  display: grid;
}
</style>
