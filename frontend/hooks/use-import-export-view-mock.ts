import type { ImportExportViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";
import { VIEW_STATUS } from "@/types/status";

export const useImportExportViewMock = (): ImportExportViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? VIEW_STATUS.ERROR : VIEW_STATUS.READY,
    exportDescription: "JSON с данными приложения",
    importDescription: "Один файл для импорта",
    retry: () => {}
  };
};
