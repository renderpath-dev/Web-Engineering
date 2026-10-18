<script setup lang="ts">
import { computed, ref } from "vue";
import {
  getActivationRule,
  nativeControlReviewItems,
  shouldPreferNativeControl,
} from "../models/keyboardInteractionModel";

const activationCount = ref(0);
const buttonRule = computed(() => getActivationRule("button"));
const linkRule = computed(() => getActivationRule("link"));
const customRule = computed(() => getActivationRule("custom"));

function activateNativeButton(): void {
  activationCount.value += 1;
}
</script>

<template>
  <section class="a11y-card" aria-labelledby="native-control-title">
    <h3 id="native-control-title">Native control boundary</h3>
    <p>
      ARIA can describe semantics, but it does not create click, focus, disabled,
      Enter, or Space behavior. Prefer native controls before custom widgets.
    </p>

    <div class="a11y-actions">
      <button class="a11y-button" type="button" @click="activateNativeButton">
        Native button action
      </button>
      <a class="a11y-button secondary" href="#chapter-15-main">
        Native link action
      </a>
    </div>

    <p class="a11y-status" role="status">
      Native button activations: {{ activationCount }}
    </p>

    <ul class="a11y-dashboard-list" aria-label="Native control review">
      <li v-for="item in nativeControlReviewItems" :key="item.id">
        <strong>{{ item.label }}</strong>
        <span>
          Preferred: {{ shouldPreferNativeControl(item.kind) ? "yes" : "no" }}.
          {{ item.evidence }}
        </span>
      </li>
    </ul>

    <p>
      Button keys: {{ buttonRule.activationKeys.join(", ") }}.
      Link keys: {{ linkRule.activationKeys.join(", ") }}.
      Custom risk: {{ customRule.failureSignal }}
    </p>
  </section>
</template>
