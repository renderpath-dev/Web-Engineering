import { randomUUID } from "node:crypto";
import { join } from "node:path";

export function writePrivateDiagnosticReport(directory = process.cwd()): string | undefined {
  if (!process.report?.writeReport) return undefined;

  const filename = join(directory, `node-report-${randomUUID()}.json`);
  return process.report.writeReport(filename);
}

export function diagnosticReportsArePublic(): false {
  return false;
}
