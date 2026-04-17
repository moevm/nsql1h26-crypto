import { ApiErrorPayload, ApiRequestOptions } from "@/types/api";
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

  return `${normalizedPath}${createQueryString(params)}`;
};

const buildHeaders = (options?: ApiRequestOptions, contentType?: "application/json"): HeadersInit => {
  const headers = new Headers(options?.headers);

  headers.set("Accept", "application/json");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return headers;
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
      headers: buildHeaders(options)
    });

    return parseResponse<T>(response);
  },
  post: async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await fetch(buildUrl(path, options?.params), {
      ...options,
      method: "POST",
      headers: buildHeaders(options, "application/json")
    });

    return parseResponse<T>(response);
  }
};
