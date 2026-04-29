import { ApiError } from "@/services/http/http-client";

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
