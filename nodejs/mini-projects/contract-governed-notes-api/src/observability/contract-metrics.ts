import {
  compatibilityCheckCounter,
  contractViolationCounter,
  deprecatedUsageCounter,
  problemResponseCounter,
  sdkParseFailureCounter,
  unsupportedVersionCounter
} from "./metrics.js";

export function recordContractViolation(checkName: string): void {
  contractViolationCounter.inc({ check_name: checkName });
}

export function recordUnsupportedVersion(versionFamily: string): void {
  unsupportedVersionCounter.inc({ version_family: versionFamily });
}

export function recordDeprecatedUsage(operationId: string): void {
  deprecatedUsageCounter.inc({ operation_id: operationId });
}

export function recordProblemResponse(code: string, statusCode: number): void {
  problemResponseCounter.inc({ code, status_class: `${Math.floor(statusCode / 100)}xx` });
}

export function recordCompatibilityCheck(result: string): void {
  compatibilityCheckCounter.inc({ result });
}

export function recordSdkParseFailure(operationId: string): void {
  sdkParseFailureCounter.inc({ operation_id: operationId });
}
