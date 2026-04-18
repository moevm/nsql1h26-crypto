import { ApiErrorPayload, ApiRequestOptions } from "@/types/api";
import { createQueryString } from "@/utils/query-string";

type HttpMethod = "GET" | "POST" | "DELETE";

type JsonContentType = "application/json";

const METHOD_CONTENT_TYPES: Partial<Record<HttpMethod, JsonContentType>> = {
  POST: "application/json"
};

export interface HttpClient {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

interface CreateHttpClientOptions {
  prepareOptions?: (options?: ApiRequestOptions) => ApiRequestOptions | undefined;
  onError?: (error: unknown, options?: ApiRequestOptions) => void;
}

interface PreparedApiRequestOptions extends Omit<ApiRequestOptions, "body"> {
  body?: RequestInit["body"];
}

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

const isJsonSerializableBody = (body: ApiRequestOptions["body"]): body is object => {
  if (body === null || body === undefined || typeof body !== "object") {
    return false;
  }

  if (
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof FormData !== "undefined" && body instanceof FormData) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  ) {
    return false;
  }

  return true;
};

const prepareRequestOptions = (
  options?: ApiRequestOptions,
  contentType?: JsonContentType
): PreparedApiRequestOptions | undefined => {
  if (!options || contentType !== "application/json" || !isJsonSerializableBody(options.body)) {
    return options as PreparedApiRequestOptions | undefined;
  }

  return {
    ...options,
    body: JSON.stringify(options.body)
  };
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

const request = async <T>(
  method: HttpMethod,
  path: string,
  options?: ApiRequestOptions,
  contentType?: JsonContentType
): Promise<T> => {
  const nextOptions = prepareRequestOptions(options, contentType);

  const response = await fetch(buildUrl(path, nextOptions?.params), {
    ...nextOptions,
    method,
    headers: buildHeaders(nextOptions, contentType)
  });

  return parseResponse<T>(response);
};

export const createHttpClient = ({
  prepareOptions,
  onError
}: CreateHttpClientOptions = {}): HttpClient => {
  const send = async <T>(
    method: HttpMethod,
    path: string,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const nextOptions = prepareOptions?.(options) ?? options;

    try {
      return await request<T>(method, path, nextOptions, METHOD_CONTENT_TYPES[method]);
    } catch (error) {
      onError?.(error, nextOptions);
      throw error;
    }
  };

  return {
    get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
      return send<T>("GET", path, options);
    },
    post<T>(path: string, options?: ApiRequestOptions): Promise<T> {
      return send<T>("POST", path, options);
    },
    delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
      return send<T>("DELETE", path, options);
    }
  };
};

export const httpClient = createHttpClient();
