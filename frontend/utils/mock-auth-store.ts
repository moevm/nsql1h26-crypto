import type { AuthRole, AuthUser } from "@/types/auth";

interface MockStoredUser extends AuthUser {
  password: string;
}

const MOCK_USERS_STORAGE_KEY = "cryptowatch.mock.users.v1";

const seedUsers: MockStoredUser[] = [
  {
    userId: "mock-user-1",
    login: "user",
    password: "User123!",
    role: "ROLE_USER",
    watchlist: [],
    favorites: []
  },
  {
    userId: "mock-admin-1",
    login: "admin",
    password: "Admin123!",
    role: "ROLE_ADMIN",
    watchlist: [],
    favorites: []
  }
];

const isBrowser = (): boolean => typeof window !== "undefined";

const resetUsers = (): MockStoredUser[] => {
  if (!isBrowser()) {
    return seedUsers;
  }

  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(seedUsers));
  return seedUsers;
};

export const mockAuthStore = {
  readUsers(): MockStoredUser[] {
    if (!isBrowser()) {
      return seedUsers;
    }

    const storedUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);

    if (!storedUsers) {
      return resetUsers();
    }

    try {
      return JSON.parse(storedUsers) as MockStoredUser[];
    } catch {
      return resetUsers();
    }
  },
  writeUsers(users: MockStoredUser[]): void {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  },
  buildToken(login: string, role: AuthRole, userId: string): string {
    return `mock-token:${userId}:${login}:${role}`;
  },
  parseToken(token: string): { userId: string; login: string; role: AuthRole } | null {
    const [prefix, userId, login, role] = token.split(":");

    if (
      prefix !== "mock-token" ||
      !userId ||
      !login ||
      (role !== "ROLE_USER" && role !== "ROLE_ADMIN")
    ) {
      return null;
    }

    return { userId, login, role };
  }
};

export type { MockStoredUser };
