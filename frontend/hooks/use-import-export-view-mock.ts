import type { ImportExportViewState } from "@/types/view-state";
import { useDemoErrorState } from "@/hooks/use-demo-error-state";

export const useImportExportViewMock = (): ImportExportViewState => {
  const hasDemoError = useDemoErrorState();

  return {
    status: hasDemoError ? "error" : "ready",
    exportDescription: "JSON с данными приложения",
    importDescription: "Один файл для импорта",
    retry: () => {}
  };
};
