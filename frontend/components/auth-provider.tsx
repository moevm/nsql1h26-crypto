"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { restoreAuthState, type AuthStatus } from "@/services/auth/auth-session";
import type { AuthSession } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

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

  const setSession = useCallback((nextSession: AuthSession) => {
    authStorage.setSession(nextSession);
    setSessionState(nextSession);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    authStorage.clearSession();
    setSessionState(null);
    setStatus("guest");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      setSession,
      clearSession
    }),
    [clearSession, session, setSession, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
