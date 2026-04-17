import { authorizedHttpClient } from "@/services/authorized-http-client";
import { httpClient } from "@/services/http-client";
import type {
  AuthApi,
  LoginRequestPayload,
  LoginResponse,
  LogoutResponse,
  RegisterRequestPayload,
  RegisterResponse,
  VerifyResponse
} from "@/types/auth";

const createAuthorizationHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`
});

export const backendAuthService: AuthApi = {
  register(payload: RegisterRequestPayload): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>("/api/auth/register", {
      body: JSON.stringify(payload)
    });
  },
  login(payload: LoginRequestPayload): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>("/api/auth/login", {
      body: JSON.stringify(payload)
    });
  },
  logout(token: string): Promise<LogoutResponse> {
    return authorizedHttpClient.post<LogoutResponse>("/api/auth/logout", {
      handleUnauthorized: false,
      headers: createAuthorizationHeader(token)
    });
  },
  verify(token: string): Promise<VerifyResponse> {
    return authorizedHttpClient.get<VerifyResponse>("/api/auth/verify", {
      handleUnauthorized: false,
      headers: createAuthorizationHeader(token)
    });
  }
};
