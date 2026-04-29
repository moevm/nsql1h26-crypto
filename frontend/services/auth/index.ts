import { backendAuthService } from "@/services/auth/backend-auth-service";
import { mockAuthService } from "@/services/auth/mock-auth-service";
import type { AuthApi } from "@/types/auth";
import { env } from "@/utils/env";

const authServiceByMode: Record<typeof env.apiMode, AuthApi> = {
  mock: mockAuthService,
  backend: backendAuthService
};

export const authService = authServiceByMode[env.apiMode];
