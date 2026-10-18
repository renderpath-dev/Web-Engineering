<script setup lang="ts">
import { rankAuthStorageRisk } from "../models/authStorageRiskModel";

const rankedOptions = rankAuthStorageRisk();
</script>

<template>
  <section class="security-card" aria-labelledby="auth-storage-title">
    <h3 id="auth-storage-title">Auth storage risk ranking</h3>
    <p>
      Storage choice changes exposure and persistence. Backend session design is
      outside this panel.
    </p>

    <div class="security-table-wrap">
      <table class="security-table">
        <thead>
          <tr>
            <th scope="col">Storage</th>
            <th scope="col">Persistence</th>
            <th scope="col">JS readable</th>
            <th scope="col">Risk</th>
            <th scope="col">Coordination</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="option in rankedOptions" :key="option.kind">
            <td>{{ option.kind }}</td>
            <td>{{ option.persistence }}</td>
            <td>{{ option.readableByJavaScript }}</td>
            <td>
              <span class="security-badge" :class="{ blocked: option.riskScore >= 8 }">
                {{ option.riskScore }}
              </span>
            </td>
            <td>{{ option.coordination }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
