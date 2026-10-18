import { auditProjectSecrets } from "../src/modules/security/security.service.js";

const result = await auditProjectSecrets();
console.log(JSON.stringify({
  status: result.status,
  findingCount: result.findings.length,
  issues: result.issues,
  findings: result.findings
}, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
