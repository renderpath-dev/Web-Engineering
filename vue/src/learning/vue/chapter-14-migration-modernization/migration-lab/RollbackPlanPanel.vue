<script setup lang="ts">
import { rollbackItems } from "../models/rollbackModel";
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">Rollback</p>
    <h3>Rollback artifact map</h3>
    <ul>
      <li v-for="item in rollbackItems" :key="item.artifact">
        <strong>{{ item.artifact }}</strong>
        <span>{{ item.owner }} / {{ item.state }}</span>
        <span>{{ item.restoreSignal }}</span>
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
  color: #be123c;
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
