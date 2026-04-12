import { ApiErrorPayload, ApiRequestOptions } from "@/types/api";
import { env } from "@/utils/env";
import { createQueryString } from "@/utils/query-string";

export class ApiError extends Error {
  status: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
  }
}

const buildUrl = (path: string, params?: ApiRequestOptions["params"]): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${env.apiBaseUrl}${normalizedPath}${createQueryString(params)}`;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";

    try {
      const errorResponse = (await response.json()) as { message?: string };
      message = errorResponse.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError({
      message,
      status: response.status
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const httpClient = {
  get: async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await fetch(buildUrl(path, options?.params), {
      ...options,
      method: "GET",
      headers: {
        Accept: "application/json",
        ...options?.headers
      }
    });

    return parseResponse<T>(response);
  },
  post: async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await fetch(buildUrl(path, options?.params), {
      ...options,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options?.headers
      }
    });

    return parseResponse<T>(response);
  }
};
