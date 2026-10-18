import { evaluateDependencyPolicy } from "../src/security/dependency-policy.js";

const result = evaluateDependencyPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
