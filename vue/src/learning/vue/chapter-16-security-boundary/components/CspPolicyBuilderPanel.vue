<script setup lang="ts">
import { useCspPolicyPreview } from "../composables/useCspPolicyPreview";

const {
  allowImagesFromDataSource,
  blockEmbedding,
  mode,
  policy,
  useEnforceMode,
  useReportOnlyMode,
} = useCspPolicyPreview();
</script>

<template>
  <section class="security-card" aria-labelledby="csp-policy-title">
    <h3 id="csp-policy-title">CSP policy preview</h3>
    <p>
      This panel builds a header string for study. Browser enforcement still
      requires server response headers.
    </p>

    <div class="security-actions" role="group" aria-label="CSP mode">
      <button class="security-button" type="button" @click="useReportOnlyMode">
        Report only
      </button>
      <button class="security-button secondary" type="button" @click="useEnforceMode">
        Enforce
      </button>
      <span class="security-badge">{{ mode }}</span>
    </div>

    <label class="security-field">
      <span>
        <input v-model="allowImagesFromDataSource" type="checkbox" />
        Allow image data source
      </span>
    </label>

    <label class="security-field">
      <span>
        <input v-model="blockEmbedding" type="checkbox" />
        Block embedding
      </span>
    </label>

    <p><strong>{{ policy.headerName }}</strong></p>
    <p class="security-output">{{ policy.serialized }}</p>
  </section>
</template>
