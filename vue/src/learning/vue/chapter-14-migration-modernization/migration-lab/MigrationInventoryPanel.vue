<script setup lang="ts">
import {
  calculateMigrationRisk,
  getBlockedMigrationItems,
  getMigrationGateState,
  migrationInventoryItems,
} from "../models/migrationInventoryModel";

const totalRisk = calculateMigrationRisk(migrationInventoryItems);
const gateState = getMigrationGateState(migrationInventoryItems);
const blockedItems = getBlockedMigrationItems(migrationInventoryItems);
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">Inventory</p>
    <h3>Migration inventory summary</h3>
    <p>
      Gate state: <strong>{{ gateState }}</strong>
    </p>
    <p>Total risk score: {{ totalRisk }}</p>
    <ul>
      <li v-for="item in migrationInventoryItems" :key="item.id">
        <strong>{{ item.legacyPattern }}</strong>
        <span>{{ item.modernOwner }}</span>
        <span>Risk {{ item.riskScore }} / {{ item.status }}</span>
      </li>
    </ul>
    <p v-if="blockedItems.length > 0">
      Blocked item: {{ blockedItems[0].legacyPattern }}
    </p>
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
  color: #0f766e;
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
  gap: 0.2rem;
}
</style>
