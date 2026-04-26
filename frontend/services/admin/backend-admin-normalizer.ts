import { ApiError } from "@/services/http/http-client";
import type { ExportResult, ImportResult } from "@/types/admin";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const createShapeError = (fieldName: string): ApiError =>
  new ApiError({
    status: 500,
    message: `Invalid admin API response: ${fieldName}`
  });

const parseIsoDateString = (value: unknown): string | null => {
  let parsed: string | null = null;

  if (value instanceof Date) {
    parsed = value.toISOString();
  } else if (typeof value === "number" && Number.isFinite(value)) {
    parsed = new Date(value).toISOString();
  } else if (typeof value === "string") {
    parsed = value.trim() || null;
  }

  if (!parsed) return null;
  return Number.isNaN(Date.parse(parsed)) ? null : parsed;
};

const parseRequiredIsoDateString = (value: unknown, fieldName: string): string => {
  const parsed = parseIsoDateString(value);
  if (!parsed) throw createShapeError(fieldName);
  return parsed;
};

const parseRecordCount = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};

  const result: Record<string, number> = {};

  for (const [key, val] of Object.entries(value)) {
    if (typeof val === "number" && Number.isFinite(val)) {
      result[key] = val;
    }
  }

  return result;
};

export const normalizeExportResult = (payload: unknown): ExportResult => {
  if (!isRecord(payload)) throw createShapeError("payload");

  const data = isRecord(payload.data) ? (payload.data as Record<string, unknown[]>) : {};
  const exportedAt = parseRequiredIsoDateString(payload.exportedAt, "exportedAt");
  const recordCount = parseRecordCount(payload.recordCount);

  return { data, exportedAt, recordCount };
};

export const normalizeImportResult = (payload: unknown): ImportResult => {
  if (!isRecord(payload)) throw createShapeError("payload");

  const message =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : "Импорт завершён";
  const recordCount = parseRecordCount(payload.recordCount);
  const importedAt = parseRequiredIsoDateString(payload.importedAt, "importedAt");

  return { message, recordCount, importedAt };
};
