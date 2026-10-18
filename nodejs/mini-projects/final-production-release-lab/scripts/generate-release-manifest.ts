import { writeReleaseManifest } from "../src/release/release-manifest.js";

const manifest = writeReleaseManifest();
console.log(JSON.stringify({
  status: "PASS",
  path: "release/release-manifest.generated.json",
  releaseDecision: manifest.releaseDecision
}, null, 2));
