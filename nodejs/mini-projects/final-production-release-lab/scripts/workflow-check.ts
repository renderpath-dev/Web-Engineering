import { evaluateWorkflowPolicy } from "../src/security/workflow-policy.js";

const result = evaluateWorkflowPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
