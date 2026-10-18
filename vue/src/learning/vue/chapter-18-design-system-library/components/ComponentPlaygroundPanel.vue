<script setup lang="ts">
import { ref } from "vue";
import { isPlaygroundControlSafe } from "../models/playgroundControlModel";
import DsButton from "../library/DsButton.vue";

const variant = ref<"primary" | "secondary" | "danger">("primary");
const safeControl = isPlaygroundControlSafe({
  name: "variant",
  controlType: "select",
  options: ["primary", "secondary", "danger"],
  allowsRawCss: false,
});
</script>

<template>
  <section class="design-card">
    <h3>Component playground</h3>
    <label class="design-field">
      Variant
      <select v-model="variant">
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="danger">Danger</option>
      </select>
    </label>
    <DsButton :variant="variant">Preview action</DsButton>
    <p>Safe control: {{ safeControl }}</p>
  </section>
</template>
