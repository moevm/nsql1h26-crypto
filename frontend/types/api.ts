export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: RequestInit["body"] | object;
  params?: Record<string, string | number | boolean | undefined>;
  handleUnauthorized?: boolean;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
}
