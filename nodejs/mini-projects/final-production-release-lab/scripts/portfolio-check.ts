import { evaluatePortfolioEvidence } from "../src/platform/portfolio-check.js";

const result = evaluatePortfolioEvidence();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
