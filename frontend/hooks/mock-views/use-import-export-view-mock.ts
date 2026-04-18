import type { ImportExportViewState } from "@/types/mock-view-state";
import { VIEW_STATUS } from "@/types/status";

export const useImportExportViewMock = (): ImportExportViewState => {
  return {
    status: VIEW_STATUS.READY,
    exportDescription: "JSON с данными приложения",
    importDescription: "Один файл для импорта",
    retry: () => {}
  };
};
