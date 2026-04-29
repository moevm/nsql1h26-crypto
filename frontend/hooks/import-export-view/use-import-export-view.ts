import { useState } from "react";

import { ApiError } from "@/services/http/http-client";
import { adminService } from "@/services/admin";
import type { ImportResult } from "@/types/admin";
import { getApiErrorMessage } from "@/utils/error-message";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type OperationStatus = "idle" | "loading" | "success" | "error";

export interface UseImportExportViewResult {
  exportStatus: OperationStatus;
  exportError: string | null;
  selectedFile: File | null;
  fileError: string | null;
  confirmPending: boolean;
  importStatus: OperationStatus;
  importResult: ImportResult | null;
  importError: string | null;
  handleExport: () => void;
  handleFileSelect: (file: File) => void;
  handleImportRequest: () => void;
  handleImportConfirm: () => void;
  handleImportCancel: () => void;
  handleReset: () => void;
}

export const useImportExportView = (): UseImportExportViewResult => {
  const [exportStatus, setExportStatus] = useState<OperationStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [importStatus, setImportStatus] = useState<OperationStatus>("idle");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const doExport = async () => {
    setExportStatus("loading");
    setExportError(null);

    try {
      const result = await adminService.exportData();

      const exportData = {
        ...result,
        data: {
          coins_meta: result.data.coins_meta ?? [],
          coin_snapshots: result.data.coin_snapshots ?? []
        },
        recordCount: {
          coins_meta: result.recordCount.coins_meta ?? 0,
          coin_snapshots: result.recordCount.coin_snapshots ?? 0
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateTimeStr = result.exportedAt.slice(0, 16).replace("T", "_").replace(":", "-");
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${dateTimeStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus("success");
    } catch (error) {
      setExportError(getApiErrorMessage(error, "Не удалось выполнить экспорт"));
      setExportStatus("error");
    }
  };

  const doImport = async () => {
    if (!selectedFile) return;

    setConfirmPending(false);
    setImportStatus("loading");
    setImportError(null);

    try {
      const result = await adminService.importData(selectedFile);
      setImportResult(result);
      setImportStatus("success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setImportError("Недостаточно прав для выполнения импорта");
      } else if (error instanceof ApiError && error.status === 400) {
        setImportError(error.message || "Неверный формат файла или данные некорректны");
      } else {
        setImportError(getApiErrorMessage(error, "Не удалось выполнить импорт"));
      }

      setImportStatus("error");
    }
  };

  const handleFileSelect = (file: File) => {
    setFileError(null);

    const isJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");

    if (!isJson) {
      setFileError("Допустимый формат файла: .json");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Размер файла не должен превышать 10 МБ");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setImportStatus("idle");
    setImportResult(null);
    setImportError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileError(null);
    setConfirmPending(false);
    setImportStatus("idle");
    setImportResult(null);
    setImportError(null);
  };

  return {
    exportStatus,
    exportError,
    selectedFile,
    fileError,
    confirmPending,
    importStatus,
    importResult,
    importError,
    handleExport: () => {
      void doExport();
    },
    handleFileSelect,
    handleImportRequest: () => {
      if (selectedFile) setConfirmPending(true);
    },
    handleImportConfirm: () => {
      void doImport();
    },
    handleImportCancel: () => {
      setConfirmPending(false);
    },
    handleReset
  };
};
