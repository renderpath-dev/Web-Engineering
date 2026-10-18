<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly direction?: "row" | "column";
    readonly gap?: "sm" | "md" | "lg";
  }>(),
  {
    direction: "column",
    gap: "md",
  },
);
</script>

<template>
  <div class="ds-stack" :class="[`ds-stack--${direction}`, `ds-stack--${gap}`]">
    <slot />
  </div>
</template>
