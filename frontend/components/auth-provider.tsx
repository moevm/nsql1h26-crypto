"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { AuthSession } from "@/types/auth";
import { authStorage } from "@/utils/auth-storage";

interface AuthContextValue {
  isHydrated: boolean;
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSessionState(authStorage.getSession());
    setIsHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrated,
      session,
      setSession(nextSession) {
        authStorage.setSession(nextSession);
        setSessionState(nextSession);
      },
      clearSession() {
        authStorage.clearSession();
        setSessionState(null);
      }
    }),
    [isHydrated, session]
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
