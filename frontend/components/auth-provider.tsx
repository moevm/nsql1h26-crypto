import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";

import {
  AUTH_STATUS,
  restoreAuthState,
  type AuthStatus
} from "@/services/auth/auth-session";
import type { AuthSession, AuthUser } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  syncSessionUser: (user: AuthUser) => AuthSession | null;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AUTH_STATUS.CHECKING);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const restoredState = await restoreAuthState();

      if (!isMounted) {
        return;
      }

      setSessionState(restoredState.session);
      setStatus(restoredState.status);
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setSession = (nextSession: AuthSession) => {
    authStorage.setSession(nextSession);
    setSessionState(nextSession);
    setStatus(AUTH_STATUS.AUTHENTICATED);
  };

  const syncSessionUser = (nextUser: AuthUser) => {
    if (!session || session.userId !== nextUser.userId) {
      return null;
    }

    const nextSession: AuthSession = {
      ...session,
      login: nextUser.login,
      role: nextUser.role,
      watchlist: [...nextUser.watchlist],
      favorites: [...nextUser.favorites]
    };

    authStorage.setSession(nextSession);

    setSessionState(nextSession);
    setStatus(AUTH_STATUS.AUTHENTICATED);

    return nextSession;
  };

  const clearSession = () => {
    authStorage.clearSession();
    setSessionState(null);
    setStatus(AUTH_STATUS.GUEST);
  };

  const value: AuthContextValue = {
    status,
    session,
    setSession,
    syncSessionUser,
    clearSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
