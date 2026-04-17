import { AUTH_ROLES } from "@/services/auth/auth-roles";
import { ApiError } from "@/services/http-client";
import type {
  AuthApi,
  LoginRequestPayload,
  LoginResponse,
  LogoutResponse,
  RegisterRequestPayload,
  RegisterResponse,
  VerifyResponse
} from "@/types/auth";
import { mockAuthStore, type MockStoredUser } from "@/utils/mock-auth-store";

const buildSessionResponse = (user: MockStoredUser): LoginResponse => ({
  success: true,
  token: mockAuthStore.buildToken(user.login, user.role, user.userId),
  userId: user.userId,
  login: user.login,
  role: user.role,
  watchlist: user.watchlist,
  favorites: user.favorites
});

const throwApiError = (status: number, message: string): never => {
  throw new ApiError({ status, message });
};

export const mockAuthService: AuthApi = {
  async register(payload: RegisterRequestPayload): Promise<RegisterResponse> {
    const users = mockAuthStore.readUsers();

    if (payload.password !== payload.passwordConfirm) {
      return throwApiError(400, "Passwords do not match");
    }

    if (users.some((user) => user.login === payload.login)) {
      return throwApiError(400, "Login already taken");
    }

    const userId = `mock-user-${Date.now()}`;
    const nextUser: MockStoredUser = {
      userId,
      login: payload.login,
      password: payload.password,
      role: AUTH_ROLES.USER,
      watchlist: [],
      favorites: []
    };

    mockAuthStore.writeUsers([...users, nextUser]);

    return {
      success: true,
      message: "User registered successfully",
      userId
    };
  },
  async login(payload: LoginRequestPayload): Promise<LoginResponse> {
    const user = mockAuthStore.readUsers().find((entry) => entry.login === payload.login);

    if (!user || user.password !== payload.password) {
      return throwApiError(401, "Invalid login or password");
    }

    return buildSessionResponse(user);
  },
  async logout(): Promise<LogoutResponse> {
    return {
      success: true,
      message: "Logged out successfully"
    };
  },
  async verify(token: string): Promise<VerifyResponse> {
    const tokenPayload = mockAuthStore.parseToken(token);

    if (!tokenPayload) {
      return throwApiError(401, "Invalid token");
    }

    const user = mockAuthStore.readUsers().find(
      (entry) =>
        entry.userId === tokenPayload.userId &&
        entry.login === tokenPayload.login &&
        entry.role === tokenPayload.role
    );

    if (!user) {
      return throwApiError(401, "User not found");
    }

    return {
      success: true,
      userId: user.userId,
      login: user.login,
      role: user.role
    };
  }
};
