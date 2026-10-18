export type ReportJob = {
  reportId: string;
  requestedBy: string;
  format: "json" | "csv";
};

export function buildReportJobName(job: ReportJob): string {
  return `report:${job.format}:${job.reportId}:${job.requestedBy}`;
}
