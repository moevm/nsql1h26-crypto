import type { AuthSession, AuthUser } from "@/types/auth";

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
  },
  syncUser(nextUser: AuthUser): AuthSession | null {
    const session = getStoredSession();

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

    setStoredSession(nextSession);

    return nextSession;
  }
};
