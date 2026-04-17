import { AUTH_ROLES } from "@/services/auth/auth-roles";
import type { AuthRole, AuthUser } from "@/types/auth";
import {
  seedMockAdminFavorites,
  seedMockAdminWatchlist,
  seedMockUserFavorites,
  seedMockUserWatchlist
} from "@/utils/mock-coin-catalog";

interface MockStoredUser extends AuthUser {
  password: string;
}

const MOCK_USERS_STORAGE_KEY = "cryptowatch.mock.users.v1";

const seedUsers: MockStoredUser[] = [
  {
    userId: "mock-user-1",
    login: "user",
    password: "User123!",
    role: AUTH_ROLES.USER,
    watchlist: seedMockUserWatchlist,
    favorites: seedMockUserFavorites
  },
  {
    userId: "mock-admin-1",
    login: "admin",
    password: "Admin123!",
    role: AUTH_ROLES.ADMIN,
    watchlist: seedMockAdminWatchlist,
    favorites: seedMockAdminFavorites
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
      (role !== AUTH_ROLES.USER && role !== AUTH_ROLES.ADMIN)
    ) {
      return null;
    }

    return { userId, login, role };
  },
  findUserByToken(token: string): MockStoredUser | null {
    const tokenPayload = this.parseToken(token);

    if (!tokenPayload) {
      return null;
    }

    return (
      this.readUsers().find(
        (entry) =>
          entry.userId === tokenPayload.userId &&
          entry.login === tokenPayload.login &&
          entry.role === tokenPayload.role
      ) ?? null
    );
  },
  replaceUser(nextUser: MockStoredUser): MockStoredUser {
    const users = this.readUsers();
    const nextUsers = users.map((user) => (user.userId === nextUser.userId ? nextUser : user));

    this.writeUsers(nextUsers);

    return nextUser;
  }
};

export type { MockStoredUser };
