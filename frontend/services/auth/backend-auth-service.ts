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
    return httpClient.post<LogoutResponse>("/api/auth/logout", {
      headers: createAuthorizationHeader(token)
    });
  },
  verify(token: string): Promise<VerifyResponse> {
    return httpClient.get<VerifyResponse>("/api/auth/verify", {
      headers: createAuthorizationHeader(token)
    });
  }
};
