import { evaluateKubernetesPolicy } from "../src/security/kubernetes-policy.js";

const result = evaluateKubernetesPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
