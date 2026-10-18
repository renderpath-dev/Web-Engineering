<script setup lang="ts">
import { computed, ref } from "vue";
import { decideBeaconFlush } from "../models/beaconFlushModel";

const payloadBytes = ref(1200);
const pageHidden = ref(true);
const decision = computed(() => decideBeaconFlush(payloadBytes.value, pageHidden.value));
</script>

<template>
  <section class="observability-card" aria-labelledby="beacon-title">
    <h3 id="beacon-title">Beacon flush model</h3>
    <label class="observability-field">
      <span>Payload bytes</span>
      <input v-model.number="payloadBytes" type="number" min="0" />
    </label>
    <label class="observability-field">
      <span>
        <input v-model="pageHidden" type="checkbox" />
        Page hidden
      </span>
    </label>
    <p>
      Method:
      <span class="observability-badge">{{ decision.method }}</span>
    </p>
    <p>Delivery verified: {{ decision.deliveryVerified }}</p>
  </section>
</template>
