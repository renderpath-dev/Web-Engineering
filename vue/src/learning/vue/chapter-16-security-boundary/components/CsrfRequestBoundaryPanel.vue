<script setup lang="ts">
import { computed, ref } from "vue";
import { apiSecurityPolicies } from "../models/apiSecurityBoundaryModel";
import {
  createSecureRequestHeaders,
  requiresServerCsrfValidation,
} from "../models/csrfRequestModel";

const selectedEndpoint = ref(apiSecurityPolicies[1]?.endpoint ?? "/api/settings");
const csrfToken = ref("demo-token");

const selectedPolicy = computed(
  () =>
    apiSecurityPolicies.find((policy) => policy.endpoint === selectedEndpoint.value) ??
    apiSecurityPolicies[0],
);
const headers = computed(() =>
  createSecureRequestHeaders({
    policy: selectedPolicy.value,
    csrfToken: csrfToken.value,
  }),
);
const serverValidationRequired = computed(() =>
  requiresServerCsrfValidation(selectedPolicy.value),
);
</script>

<template>
  <section class="security-card" aria-labelledby="csrf-boundary-title">
    <h3 id="csrf-boundary-title">CSRF request boundary</h3>

    <label class="security-field">
      <span>Endpoint</span>
      <select v-model="selectedEndpoint">
        <option
          v-for="policy in apiSecurityPolicies"
          :key="policy.endpoint"
          :value="policy.endpoint"
        >
          {{ policy.method }} {{ policy.endpoint }}
        </option>
      </select>
    </label>

    <label class="security-field">
      <span>CSRF token placeholder</span>
      <input v-model="csrfToken" />
    </label>

    <p>
      Server validation required:
      <span class="security-badge" :class="{ review: serverValidationRequired }">
        {{ serverValidationRequired }}
      </span>
    </p>
    <pre class="security-output">{{ JSON.stringify(headers, null, 2) }}</pre>
  </section>
</template>
