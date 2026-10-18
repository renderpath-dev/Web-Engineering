<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly status?: "info" | "success" | "warning" | "danger";
    readonly dismissible?: boolean;
    readonly announce?: boolean;
  }>(),
  {
    status: "info",
    dismissible: false,
    announce: false,
  },
);

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <section
    class="ds-alert"
    :class="`ds-alert--${status}`"
    :role="props.announce ? 'status' : undefined"
  >
    <strong class="ds-alert__status">{{ status }}</strong>
    <div class="ds-alert__content">
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="ds-alert__dismiss"
      @click="emit('dismiss')"
    >
      Dismiss
    </button>
  </section>
</template>
