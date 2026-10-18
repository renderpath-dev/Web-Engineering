<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly variant?: "primary" | "secondary" | "danger";
    readonly size?: "sm" | "md" | "lg";
    readonly loading?: boolean;
    readonly disabled?: boolean;
    readonly type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button",
  },
);

const emit = defineEmits<{
  press: [event: MouseEvent];
}>();

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }

  emit("press", event);
}
</script>

<template>
  <button
    :type="type"
    class="ds-button"
    :class="[`ds-button--${variant}`, `ds-button--${size}`]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" aria-hidden="true">Loading</span>
    <slot />
  </button>
</template>
