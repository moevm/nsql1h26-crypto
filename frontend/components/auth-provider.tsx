"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { restoreAuthState, type AuthStatus } from "@/services/auth/auth-session";
import type { AuthSession } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

interface AuthFlowNotice {
  tone: "success" | "error";
  message: string;
}

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  authFlowNotice: AuthFlowNotice | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setAuthFlowNotice: (notice: AuthFlowNotice) => void;
  clearAuthFlowNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [authFlowNotice, setAuthFlowNoticeState] = useState<AuthFlowNotice | null>(null);

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

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      authFlowNotice,
      setSession(nextSession) {
        authStorage.setSession(nextSession);
        setSessionState(nextSession);
        setStatus("authenticated");
      },
      clearSession() {
        authStorage.clearSession();
        setSessionState(null);
        setStatus("guest");
      },
      setAuthFlowNotice(notice) {
        setAuthFlowNoticeState(notice);
      },
      clearAuthFlowNotice() {
        setAuthFlowNoticeState(null);
      }
    }),
    [authFlowNotice, session, status]
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
