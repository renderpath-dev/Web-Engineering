import { evaluateDockerPolicy } from "../src/security/docker-policy.js";

const result = evaluateDockerPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
