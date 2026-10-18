<script setup lang="ts">
import { describeEscapedPreview } from "../models/escapedRenderingModel";
import { useSafeTextPreview } from "../composables/useSafeTextPreview";

const { rawValue, preview } = useSafeTextPreview("Guest <student>");
</script>

<template>
  <section class="security-card" aria-labelledby="escaped-text-title">
    <h3 id="escaped-text-title">Escaped text rendering</h3>

    <label class="security-field">
      <span>Raw display value</span>
      <textarea v-model="rawValue" />
    </label>

    <div class="security-output" aria-live="polite">
      <strong>Rendered text:</strong>
      <span>{{ preview.renderedText }}</span>
    </div>

    <p>{{ describeEscapedPreview(preview) }}</p>
  </section>
</template>
