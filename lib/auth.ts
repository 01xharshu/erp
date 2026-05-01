// Client-side auth/session helpers migrated from localStorage to module-level memory synced via AuthSynchronizer

export type UserRole = "student" | "faculty" | "admin";

export interface AuthUser {
  role: UserRole;
  uniqueId: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

let inMemoryToken: string | null = null;
let inMemorySession: AuthUser | null = null;

// Called synchronously by AuthSynchronizer on mount in app/layout.tsx
export const syncAuthWithContext = (session: AuthUser | null, token: string | null) => {
  inMemorySession = session;
  inMemoryToken = token;
};

// Deprecated: No longer writes to localStorage, the backend auth API sets an HttpOnly cookie
export const setAuthSession = (token: string, user: AuthUser): void => {
  inMemoryToken = token;
  inMemorySession = user;
};

export const logout = (): void => {
  inMemoryToken = null;
  inMemorySession = null;
  // Let the API endpoint handle the cookie clearing
  if (typeof window !== "undefined") {
    fetch("/api/auth/logout", { method: "POST" })
      .finally(() => {
         window.location.href = "/login";
      });
  }
};

export const isAuthenticated = (): boolean => {
  return Boolean(inMemoryToken);
};

export const getAuthToken = (): string | null => {
  return inMemoryToken;
};

export const getUserData = <T = AuthUser>(): T | null => {
  return inMemorySession as unknown as T | null;
};

export const getUserRole = (): UserRole | null => {
  return inMemorySession?.role || null;
};

export const storeStudentData = (studentData: unknown): void => {
  inMemorySession = studentData as AuthUser;
};

export const getStudentData = (): unknown => getUserData();
