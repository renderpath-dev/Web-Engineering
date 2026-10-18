<script setup lang="ts">
import { useSecurityIssueGate } from "../composables/useSecurityIssueGate";
import { securityIssues } from "../models/securityIssueModel";

const { blockingIssues, releaseAllowed } = useSecurityIssueGate(securityIssues);
</script>

<template>
  <section class="security-card" aria-labelledby="security-verification-title">
    <h3 id="security-verification-title">Security verification evidence</h3>
    <p>
      The dashboard tracks open learning issues. It is not a production security
      certification.
    </p>

    <p>
      Release allowed:
      <span class="security-badge" :class="{ blocked: !releaseAllowed }">
        {{ releaseAllowed }}
      </span>
    </p>

    <ul class="security-list">
      <li v-for="issue in securityIssues" :key="issue.id">
        <h4>{{ issue.title }}</h4>
        <p>
          <span class="security-badge" :class="{ blocked: issue.status === 'open' }">
            {{ issue.severity }} / {{ issue.status }}
          </span>
        </p>
        <p>{{ issue.evidence }}</p>
        <p>Rollback: {{ issue.rollbackPath }}</p>
      </li>
    </ul>

    <p class="security-output">
      Blocking issue count: {{ blockingIssues.length }}
    </p>
  </section>
</template>
