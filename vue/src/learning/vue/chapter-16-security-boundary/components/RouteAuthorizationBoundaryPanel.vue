<script setup lang="ts">
import { computed, ref } from "vue";
import { reviewRouteAuthorization } from "../models/routeAuthorizationBoundaryModel";

const routeName = ref("admin-users");
const hasClientRole = ref(false);
const apiRequiresServerRole = ref(true);

const review = computed(() =>
  reviewRouteAuthorization({
    routeName: routeName.value,
    hasClientRole: hasClientRole.value,
    apiRequiresServerRole: apiRequiresServerRole.value,
  }),
);
</script>

<template>
  <section class="security-card" aria-labelledby="route-boundary-title">
    <h3 id="route-boundary-title">Route authorization boundary</h3>

    <label class="security-field">
      <span>Route name</span>
      <input v-model="routeName" />
    </label>

    <label class="security-field">
      <span>
        <input v-model="hasClientRole" type="checkbox" />
        Client role present
      </span>
    </label>

    <label class="security-field">
      <span>
        <input v-model="apiRequiresServerRole" type="checkbox" />
        API requires server role
      </span>
    </label>

    <p>
      Decision:
      <span class="security-badge review">{{ review.decision }}</span>
    </p>
    <p>{{ review.reason }}</p>
  </section>
</template>
