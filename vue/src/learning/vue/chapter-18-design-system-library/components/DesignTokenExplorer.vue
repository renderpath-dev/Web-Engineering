<script setup lang="ts">
import {
  listDeprecatedTokens,
  primitiveDesignTokens,
} from "../models/designTokenModel";
import { semanticDesignTokens } from "../models/semanticTokenModel";

const deprecatedTokens = listDeprecatedTokens(primitiveDesignTokens);
</script>

<template>
  <section class="design-card">
    <h3>Design token explorer</h3>
    <p>Primitive tokens own raw values. Semantic tokens own component intent.</p>
    <ul class="design-list">
      <li v-for="token in primitiveDesignTokens" :key="token.name">
        <code>{{ token.name }}</code>
        <span>{{ token.value }}</span>
      </li>
    </ul>
    <p>Semantic count: {{ semanticDesignTokens.length }}</p>
    <p>Deprecated token count: {{ deprecatedTokens.length }}</p>
  </section>
</template>
