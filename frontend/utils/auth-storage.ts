import type { AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "cryptowatch.auth.session.v1";

const isBrowser = (): boolean => typeof window !== "undefined";

const setStoredSession = (session: AuthSession): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const getStoredSession = (): AuthSession | null => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const authStorage = {
  getSession(): AuthSession | null {
    return getStoredSession();
  },
  setSession(session: AuthSession): void {
    setStoredSession(session);
  },
  clearSession(): void {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  },
  getToken(): string | null {
    return getStoredSession()?.token ?? null;
  }
};
