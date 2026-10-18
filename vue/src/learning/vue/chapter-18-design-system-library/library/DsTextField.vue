<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly error?: string;
    readonly disabled?: boolean;
  }>(),
  {
    description: "",
    error: "",
    disabled: false,
  },
);

const descriptionId = computed(() => `${props.id}-description`);
const errorId = computed(() => `${props.id}-error`);
const describedBy = computed(() => {
  const ids = [];

  if (props.description) {
    ids.push(descriptionId.value);
  }

  if (props.error) {
    ids.push(errorId.value);
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
});
</script>

<template>
  <label class="ds-field" :for="id">
    <span class="ds-field__label">{{ label }}</span>
    <input
      :id="id"
      v-model="model"
      class="ds-field__input"
      :aria-describedby="describedBy"
      :aria-invalid="Boolean(error)"
      :disabled="disabled"
    />
    <span v-if="description" :id="descriptionId" class="ds-field__description">
      {{ description }}
    </span>
    <span v-if="error" :id="errorId" class="ds-field__error">
      {{ error }}
    </span>
  </label>
</template>
