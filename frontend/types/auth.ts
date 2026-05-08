import type { AUTH_ROLES } from "@/services/auth/auth-roles";

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export interface AuthUser {
  userId: string;
  login: string;
  role: AuthRole;
  watchlist: string[];
  favorites: string[];
}

export interface AuthSession extends AuthUser {
  token: string;
}

export interface LoginRequestPayload {
  login: string;
  password: string;
}

export interface RegisterRequestPayload {
  login: string;
  password: string;
  passwordConfirm: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  userId: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  userId: string;
  login: string;
  role: AuthRole;
  watchlist: string[];
  favorites: string[];
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface VerifyResponse {
  success: boolean;
  userId: string;
  login: string;
  role: AuthRole;
}

export interface AuthApi {
  register(payload: RegisterRequestPayload): Promise<RegisterResponse>;
  login(payload: LoginRequestPayload): Promise<LoginResponse>;
  logout(token: string): Promise<LogoutResponse>;
  verify(token: string): Promise<VerifyResponse>;
}
