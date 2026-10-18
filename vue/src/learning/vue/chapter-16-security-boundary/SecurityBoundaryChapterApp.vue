<script setup lang="ts">
import "./security-boundary.css";
import ApiSecurityBoundaryPanel from "./components/ApiSecurityBoundaryPanel.vue";
import AuthStorageRiskPanel from "./components/AuthStorageRiskPanel.vue";
import CspPolicyBuilderPanel from "./components/CspPolicyBuilderPanel.vue";
import CsrfRequestBoundaryPanel from "./components/CsrfRequestBoundaryPanel.vue";
import DangerousSinkPanel from "./components/DangerousSinkPanel.vue";
import DependencyRiskPanel from "./components/DependencyRiskPanel.vue";
import EnvExposurePanel from "./components/EnvExposurePanel.vue";
import EscapedTextRenderingDemo from "./components/EscapedTextRenderingDemo.vue";
import PrivacyDataClassificationPanel from "./components/PrivacyDataClassificationPanel.vue";
import RichTextRiskPanel from "./components/RichTextRiskPanel.vue";
import RouteAuthorizationBoundaryPanel from "./components/RouteAuthorizationBoundaryPanel.vue";
import SafeStyleAllowlistPanel from "./components/SafeStyleAllowlistPanel.vue";
import SafeUrlReviewPanel from "./components/SafeUrlReviewPanel.vue";
import SecurityVerificationDashboard from "./components/SecurityVerificationDashboard.vue";
import TrustedRenderingPanel from "./components/TrustedRenderingPanel.vue";
</script>

<template>
  <section class="chapter-section chapter-16" aria-labelledby="chapter-16-title">
    <header class="hero">
      <p class="eyebrow">Chapter 16</p>
      <h2 id="chapter-16-title">
        Security, Trusted Boundary, XSS, CSRF, CSP, and Privacy Evidence
      </h2>
      <p>
        Model client-side security boundaries with inspectable data flow while
        keeping enforcement claims outside the Vue component layer.
      </p>
    </header>

    <TrustedRenderingPanel />

    <div class="security-grid">
      <EscapedTextRenderingDemo />
      <RichTextRiskPanel />
      <SafeUrlReviewPanel />
      <SafeStyleAllowlistPanel />
      <DangerousSinkPanel />
      <CspPolicyBuilderPanel />
      <ApiSecurityBoundaryPanel />
      <CsrfRequestBoundaryPanel />
      <AuthStorageRiskPanel />
      <RouteAuthorizationBoundaryPanel />
      <PrivacyDataClassificationPanel />
      <EnvExposurePanel />
      <DependencyRiskPanel />
    </div>

    <SecurityVerificationDashboard />

    <footer class="security-card">
      <p>
        This lab records learning evidence. Backend authorization, deployed CSP,
        dependency scanning, and privacy review remain external verification
        tasks.
      </p>
    </footer>
  </section>
</template>
