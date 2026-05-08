import { authorizedHttpClient } from "@/services/http/authorized-http-client";
import { httpClient } from "@/services/http/http-client";
import type {
  AuthApi,
  LoginRequestPayload,
  LoginResponse,
  LogoutResponse,
  RegisterRequestPayload,
  RegisterResponse,
  VerifyResponse
} from "@/types/auth";

export const backendAuthService: AuthApi = {
  register(payload: RegisterRequestPayload): Promise<RegisterResponse> {
    return httpClient.post<RegisterResponse>("/api/auth/register", {
      body: payload
    });
  },
  login(payload: LoginRequestPayload): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>("/api/auth/login", {
      body: payload
    });
  },
  logout(token: string): Promise<LogoutResponse> {
    return authorizedHttpClient.post<LogoutResponse>("/api/auth/logout", {
      handleUnauthorized: false,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  verify(token: string): Promise<VerifyResponse> {
    return authorizedHttpClient.get<VerifyResponse>("/api/auth/verify", {
      handleUnauthorized: false,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
