import { authService } from "@/services/auth";
import type { AuthSession } from "@/types/auth";
import { AUTH_STATUS, type AuthStatus } from "@/types/status";
import { authStorage } from "@/utils/auth-storage";

export { AUTH_STATUS };
export type { AuthStatus } from "@/types/status";

interface RestoredAuthState {
  status: AuthStatus;
  session: AuthSession | null;
}

export const restoreAuthState = async (): Promise<RestoredAuthState> => {
  const storedSession = authStorage.getSession();

  if (!storedSession) {
    return {
      status: AUTH_STATUS.GUEST,
      session: null
    };
  }

  try {
    const verifiedSession = await authService.verify(storedSession.token);
    const nextSession: AuthSession = {
      ...storedSession,
      userId: verifiedSession.userId,
      login: verifiedSession.login,
      role: verifiedSession.role
    };

    authStorage.setSession(nextSession);

    return {
      status: AUTH_STATUS.AUTHENTICATED,
      session: nextSession
    };
  } catch {
    authStorage.clearSession();

    return {
      status: AUTH_STATUS.GUEST,
      session: null
    };
  }
};
