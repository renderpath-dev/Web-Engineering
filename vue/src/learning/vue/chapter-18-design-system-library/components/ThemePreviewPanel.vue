<script setup lang="ts">
import { computed } from "vue";
import { useThemeTokens } from "../composables/useThemeTokens";
import type { ThemeVariantName } from "../models/themeVariantModel";

const { currentVariant, cssText, setThemeVariant } = useThemeTokens("light");
const previewStyle = computed(() =>
  Object.fromEntries(
    cssText.value.split("\n").map((line) => {
      const [name, value] = line.replace(";", "").split(": ");

      return [name, value];
    }),
  ),
);

function selectVariant(event: Event): void {
  const select = event.target as HTMLSelectElement;
  setThemeVariant(select.value as ThemeVariantName);
}
</script>

<template>
  <section class="design-card">
    <h3>Theme preview</h3>
    <label class="design-field">
      Theme variant
      <select :value="currentVariant" @change="selectVariant">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="high-contrast">High Contrast</option>
      </select>
    </label>
    <div class="theme-preview" :style="previewStyle">
      <strong>Token based preview</strong>
      <span>{{ currentVariant }}</span>
    </div>
  </section>
</template>
