import type { ApiRequestOptions } from "@/types/api";
import { authStorage } from "@/utils/auth-storage";

import { ApiError, httpClient } from "@/services/http-client";

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

const withUnauthorizedHandling = async <T>(
  request: Promise<T>,
  options?: ApiRequestOptions
): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    if (shouldHandleUnauthorized(error, options)) {
      unauthorizedHandlers.forEach((handler) => {
        handler();
      });
    }

    throw error;
  }
};

export const authHttpClient = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    const nextOptions = buildAuthorizedOptions(options);

    return withUnauthorizedHandling(httpClient.get<T>(path, nextOptions), nextOptions);
  },
  post<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    const nextOptions = buildAuthorizedOptions(options);

    return withUnauthorizedHandling(httpClient.post<T>(path, nextOptions), nextOptions);
  }
};

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.add(handler);

  return () => {
    unauthorizedHandlers.delete(handler);
  };
};
