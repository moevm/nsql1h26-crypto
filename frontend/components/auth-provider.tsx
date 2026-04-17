"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { authService } from "@/services/auth";
import type { AuthSession } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

type AuthStatus = "checking" | "authenticated" | "guest";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  authFlowMessage: string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setAuthFlowMessage: (message: string) => void;
  clearAuthFlowMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [authFlowMessage, setAuthFlowMessageState] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const storedSession = authStorage.getSession();

      if (!storedSession) {
        if (isMounted) {
          setSessionState(null);
          setStatus("guest");
        }

        return;
      }

      try {
        const verifiedSession = await authService.verify(storedSession.token);
        const nextSession: AuthSession = {
          ...storedSession,
          userId: verifiedSession.userId,
          login: verifiedSession.login,
          role: verifiedSession.role
        };

        if (!isMounted) {
          return;
        }

        authStorage.setSession(nextSession);
        setSessionState(nextSession);
        setStatus("authenticated");
      } catch {
        if (!isMounted) {
          return;
        }

        authStorage.clearSession();
        setSessionState(null);
        setStatus("guest");
      }
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
      authFlowMessage,
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
      setAuthFlowMessage(message) {
        setAuthFlowMessageState(message);
      },
      clearAuthFlowMessage() {
        setAuthFlowMessageState(null);
      }
    }),
    [authFlowMessage, session, status]
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
