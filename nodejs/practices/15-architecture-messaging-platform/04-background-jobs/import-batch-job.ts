export type ImportBatch = {
  projectId: string;
  sourceName: string;
  rows: Array<{ title: string }>;
};

export function countImportRows(batch: ImportBatch): number {
  return batch.rows.filter((row) => row.title.trim().length > 0).length;
}
