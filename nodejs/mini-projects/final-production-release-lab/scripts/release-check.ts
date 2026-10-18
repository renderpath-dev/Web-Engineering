import { evaluateLocalReleaseReadiness } from "../src/platform/release-check.js";

const result = await evaluateLocalReleaseReadiness();
console.log(JSON.stringify(result, null, 2));
process.exit(result.decision === "promote" ? 0 : 1);
