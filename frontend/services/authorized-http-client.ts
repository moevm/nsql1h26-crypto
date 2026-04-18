import type { ApiRequestOptions } from "@/types/api";
import { authStorage } from "@/utils/auth-storage";

import { ApiError, createHttpClient } from "@/services/http-client";

type UnauthorizedHandler = () => void;

const unauthorizedHandlers = new Set<UnauthorizedHandler>();

const buildAuthorizedOptions = (options?: ApiRequestOptions): ApiRequestOptions => {
  const headers = new Headers(options?.headers);

  if (!headers.has("Authorization")) {
    const token = authStorage.getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return {
    ...options,
    headers
  };
};

const shouldHandleUnauthorized = (error: unknown, options?: ApiRequestOptions): boolean => {
  if (options?.handleUnauthorized === false) {
    return false;
  }

  return error instanceof ApiError && error.status === 401;
};

const handleUnauthorizedError = (error: unknown, options?: ApiRequestOptions): void => {
  if (shouldHandleUnauthorized(error, options)) {
    unauthorizedHandlers.forEach((handler) => {
      handler();
    });
  }
};

export const authorizedHttpClient = createHttpClient({
  prepareOptions: buildAuthorizedOptions,
  onError: handleUnauthorizedError
});

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.add(handler);

  return () => {
    unauthorizedHandlers.delete(handler);
  };
};
