export interface ExportResult {
  data: Record<string, unknown[]>;
  exportedAt: string;
  recordCount: Record<string, number>;
}

export interface ImportResult {
  message: string;
  recordCount: Record<string, number>;
  importedAt: string;
}
