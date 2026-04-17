export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  handleUnauthorized?: boolean;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
}
