<script setup lang="ts">
import { computed, ref } from "vue";
import { reviewUrlValue } from "../models/safeUrlModel";

const urlInput = ref("/settings?tab=profile");
const review = computed(() => reviewUrlValue(urlInput.value));

function useSameOriginPath(): void {
  urlInput.value = "/orders?page=1";
}

function useExternalHttpsUrl(): void {
  urlInput.value = "https://docs.example/security";
}

function useBlockedProtocolValue(): void {
  urlInput.value = ["java", "script:blocked-action"].join("");
}
</script>

<template>
  <section class="security-card" aria-labelledby="safe-url-title">
    <h3 id="safe-url-title">URL review before binding</h3>

    <label class="security-field">
      <span>Candidate URL value</span>
      <input v-model="urlInput" />
    </label>

    <div class="security-actions">
      <button class="security-button" type="button" @click="useSameOriginPath">
        Use same-origin path
      </button>
      <button class="security-button secondary" type="button" @click="useExternalHttpsUrl">
        Use external HTTPS
      </button>
      <button class="security-button secondary" type="button" @click="useBlockedProtocolValue">
        Use blocked protocol
      </button>
    </div>

    <p>
      Status:
      <span
        class="security-badge"
        :class="{
          blocked: review.status === 'blocked',
          review: review.status === 'requires-backend-review',
        }"
      >
        {{ review.status }}
      </span>
    </p>
    <p class="security-output">{{ review.normalizedUrl || "No safe URL output" }}</p>
    <p>{{ review.reason }}</p>
  </section>
</template>
