import test from "node:test";
import assert from "node:assert/strict";
import { validateKubernetesManifests } from "../scripts/k8s-check.js";

test("validates static Kubernetes manifests", async () => {
  const result = await validateKubernetesManifests();
  assert.deepEqual(result.resources.sort(), ["ConfigMap", "Deployment", "Namespace", "Secret", "Service"].sort());
});
