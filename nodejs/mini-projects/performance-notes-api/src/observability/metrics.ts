import { Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: "performance-notes-api"
});

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "nodejs_"
});
