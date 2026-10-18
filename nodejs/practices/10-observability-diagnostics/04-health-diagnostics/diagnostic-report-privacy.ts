export function canExposeDiagnosticReportOverHttp(): false { return false; }
export function diagnosticReportPolicy() { return { publicEndpoint: canExposeDiagnosticReportOverHttp(), reason: "Diagnostic reports can include process, environment, stack, and native state." }; }
console.log(diagnosticReportPolicy());
