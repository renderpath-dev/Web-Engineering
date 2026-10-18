<script setup lang="ts">
import "./observability-incident.css";
import ApiFailureTelemetryPanel from "./components/ApiFailureTelemetryPanel.vue";
import AppErrorHandlerPanel from "./components/AppErrorHandlerPanel.vue";
import AsyncComponentRecoveryPanel from "./components/AsyncComponentRecoveryPanel.vue";
import BeaconFlushPanel from "./components/BeaconFlushPanel.vue";
import ComponentErrorBoundaryDemo from "./components/ComponentErrorBoundaryDemo.vue";
import ErrorFallbackPanel from "./components/ErrorFallbackPanel.vue";
import GlobalErrorListenerPanel from "./components/GlobalErrorListenerPanel.vue";
import IncidentRollbackPanel from "./components/IncidentRollbackPanel.vue";
import NavigationTimingPanel from "./components/NavigationTimingPanel.vue";
import OfflineTelemetryQueuePanel from "./components/OfflineTelemetryQueuePanel.vue";
import PerformanceMarksPanel from "./components/PerformanceMarksPanel.vue";
import PostIncidentReviewPanel from "./components/PostIncidentReviewPanel.vue";
import ReleaseHealthDashboard from "./components/ReleaseHealthDashboard.vue";
import ResourceTimingPanel from "./components/ResourceTimingPanel.vue";
import RouteTelemetryPanel from "./components/RouteTelemetryPanel.vue";
import SamplingRateLimitPanel from "./components/SamplingRateLimitPanel.vue";
import SourceMapBoundaryPanel from "./components/SourceMapBoundaryPanel.vue";
import TelemetryRedactionPanel from "./components/TelemetryRedactionPanel.vue";
import WebVitalsBudgetPanel from "./components/WebVitalsBudgetPanel.vue";
</script>

<template>
  <section class="chapter-section chapter-17" aria-labelledby="chapter-17-title">
    <header class="hero">
      <p class="eyebrow">Chapter 17</p>
      <h2 id="chapter-17-title">
        Observability, Error Recovery, Performance Telemetry, and Incident Evidence
      </h2>
      <p>
        Model local observability signals, privacy-safe telemetry, release
        health, and incident evidence without sending external telemetry.
      </p>
    </header>

    <div class="observability-grid">
      <AppErrorHandlerPanel />
      <ComponentErrorBoundaryDemo />
      <ErrorFallbackPanel />
      <GlobalErrorListenerPanel />
      <AsyncComponentRecoveryPanel />
      <ApiFailureTelemetryPanel />
      <RouteTelemetryPanel />
      <PerformanceMarksPanel />
      <NavigationTimingPanel />
      <ResourceTimingPanel />
      <WebVitalsBudgetPanel />
      <TelemetryRedactionPanel />
      <SamplingRateLimitPanel />
      <BeaconFlushPanel />
      <OfflineTelemetryQueuePanel />
      <SourceMapBoundaryPanel />
      <ReleaseHealthDashboard />
      <IncidentRollbackPanel />
      <PostIncidentReviewPanel />
    </div>

    <footer class="observability-card">
      <p>
        This lab records local evidence. Real collector ingestion, dashboards,
        alerting, source-map deployment policy, field RUM, and incident process
        remain external verification tasks.
      </p>
    </footer>
  </section>
</template>
