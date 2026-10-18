<script setup lang="ts">
import {
  canEnterTemplateCompiler,
  getBoundaryFailureSignal,
  trustedBoundaryItems,
} from "../models/trustedBoundaryModel";
</script>

<template>
  <section class="security-card" aria-labelledby="trusted-boundary-title">
    <h3 id="trusted-boundary-title">Trusted boundary map</h3>
    <p>
      Templates stay in trusted source. User and API values stay as data until a
      reviewed boundary accepts them.
    </p>

    <div class="security-table-wrap">
      <table class="security-table">
        <thead>
          <tr>
            <th scope="col">Value</th>
            <th scope="col">Trust level</th>
            <th scope="col">Allowed sink</th>
            <th scope="col">Blocked sink</th>
            <th scope="col">Signal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in trustedBoundaryItems" :key="item.id">
            <td>{{ item.label }}</td>
            <td>
              <span
                class="security-badge"
                :class="{ blocked: !canEnterTemplateCompiler(item) }"
              >
                {{ item.trustLevel }}
              </span>
            </td>
            <td>{{ item.allowedSink }}</td>
            <td>{{ item.blockedSink }}</td>
            <td>{{ getBoundaryFailureSignal(item) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
