<script setup lang="ts">
import { legacyRouterConfig } from "../legacy-shaped/legacyRouterConfig";
import {
  getRouteAuthRequirement,
  modernRouteRecords,
} from "../modernized/modernRouterConfig";
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">Router</p>
    <h3>Router 3 config to Router 4 config</h3>
    <p>Legacy mode: {{ legacyRouterConfig.mode }}</p>
    <ul>
      <li v-for="route in modernRouteRecords" :key="route.name">
        <strong>{{ route.name }}</strong>
        <span>{{ route.path }}</span>
        <span>Auth required: {{ getRouteAuthRequirement(route.name) }}</span>
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
  color: #2563eb;
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
