<script setup lang="ts">
import { computed, ref } from "vue";
import { classifyRichTextInput } from "../models/htmlSanitizationModel";

const tagName = ref("strong");
const attributeName = ref("class");

const review = computed(() =>
  classifyRichTextInput("cms-preview", tagName.value, [attributeName.value]),
);
</script>

<template>
  <section class="security-card" aria-labelledby="rich-text-risk-title">
    <h3 id="rich-text-risk-title">Rich text review model</h3>
    <p>
      This panel classifies rich text metadata. It does not render rich text as
      executable markup.
    </p>

    <label class="security-field">
      <span>Tag name</span>
      <select v-model="tagName">
        <option value="strong">strong</option>
        <option value="p">p</option>
        <option value="script">script</option>
        <option value="custom-widget">custom-widget</option>
      </select>
    </label>

    <label class="security-field">
      <span>Attribute name</span>
      <select v-model="attributeName">
        <option value="class">class</option>
        <option value="style">style</option>
        <option value="onclick">onclick</option>
        <option value="data-track">data-track</option>
      </select>
    </label>

    <p>
      Decision:
      <span
        class="security-badge"
        :class="{
          blocked: review.decision === 'blocked',
          review: review.decision === 'requires-backend-review',
        }"
      >
        {{ review.decision }}
      </span>
    </p>
    <p>{{ review.reason }}</p>
  </section>
</template>
