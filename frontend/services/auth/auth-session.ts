import { authService } from "@/services/auth";
import type { AuthSession } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

export type AuthStatus = "checking" | "authenticated" | "guest";

interface RestoredAuthState {
  status: AuthStatus;
  session: AuthSession | null;
}

export const restoreAuthState = async (): Promise<RestoredAuthState> => {
  const storedSession = authStorage.getSession();

  if (!storedSession) {
    return {
      status: "guest",
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
      status: "authenticated",
      session: nextSession
    };
  } catch {
    authStorage.clearSession();

    return {
      status: "guest",
      session: null
    };
  }
};
