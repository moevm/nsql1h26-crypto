export const VIEW_STATUS = {
  LOADING: "loading",
  READY: "ready",
  EMPTY: "empty",
  ERROR: "error"
} as const;

export type ViewStatus = (typeof VIEW_STATUS)[keyof typeof VIEW_STATUS];

export const AUTH_STATUS = {
  CHECKING: "checking",
  AUTHENTICATED: "authenticated",
  GUEST: "guest"
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];
