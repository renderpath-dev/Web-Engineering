<script setup lang="ts">
import {
  apiSecurityPolicies,
  describeApiSecurityBoundary,
} from "../models/apiSecurityBoundaryModel";
</script>

<template>
  <section class="security-card" aria-labelledby="api-security-title">
    <h3 id="api-security-title">API security boundary</h3>
    <p>
      Vue can prepare request metadata, but the backend remains responsible for
      authorization decisions.
    </p>

    <ul class="security-list">
      <li v-for="policy in apiSecurityPolicies" :key="policy.endpoint">
        <h4>{{ policy.method }} {{ policy.endpoint }}</h4>
        <p>{{ describeApiSecurityBoundary(policy) }}</p>
        <p>
          Credentials:
          <span class="security-badge">{{ policy.credentialsMode }}</span>
        </p>
      </li>
    </ul>
  </section>
</template>
