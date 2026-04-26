import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import {
  normalizeExportResult,
  normalizeImportResult
} from "@/services/admin/backend-admin-normalizer";
import type { ExportResult, ImportResult } from "@/types/admin";

export const backendAdminService = {
  async exportData(): Promise<ExportResult> {
    const response = await authorizedHttpClient.get<unknown>("/api/admin/export");
    return normalizeExportResult(response);
  },

  async importData(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await authorizedHttpClient.post<unknown>("/api/admin/import", {
      body: formData
    });

    return normalizeImportResult(response);
  }
};
