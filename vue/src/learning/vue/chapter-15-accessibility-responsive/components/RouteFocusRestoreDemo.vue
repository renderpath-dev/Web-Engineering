<script setup lang="ts">
import { routeFocusPlans, createFocusRestoreMessage } from "../models/focusManagementModel";
import { useFocusRestore } from "../composables/useFocusRestore";

const plan = routeFocusPlans[0];
const routeFocusTargetId = "chapter-15-route-focus-target";
const { targetRef, lastFocusedId, restoreFocus } = useFocusRestore(routeFocusTargetId);
</script>

<template>
  <section class="a11y-card" aria-labelledby="route-focus-demo-title">
    <h3 id="route-focus-demo-title">Route focus restore</h3>
    <p>{{ createFocusRestoreMessage(plan) }}</p>
    <button class="a11y-button" type="button" @click="restoreFocus('route-change')">
      Simulate route focus restore
    </button>
    <p
      :id="routeFocusTargetId"
      ref="targetRef"
      tabindex="-1"
      class="a11y-status"
    >
      Main target focus marker: {{ lastFocusedId || "not focused yet" }}
    </p>
  </section>
</template>
