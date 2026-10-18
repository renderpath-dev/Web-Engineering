<script setup lang="ts">
import { ref } from "vue";
import { usePrefersReducedMotion } from "../composables/usePrefersReducedMotion";

const visible = ref(true);
const { policy } = usePrefersReducedMotion();
</script>

<template>
  <section class="a11y-card" aria-labelledby="reduced-motion-title">
    <h3 id="reduced-motion-title">Reduced motion transition</h3>
    <button class="a11y-button" type="button" @click="visible = !visible">
      Toggle evidence panel
    </button>
    <Transition :name="policy.transitionName">
      <p v-if="visible" class="a11y-status">
        Motion policy {{ policy.preference }} keeps content visible.
      </p>
    </Transition>
  </section>
</template>

