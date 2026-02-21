// Client-side auth/session helpers.

const AUTH_TOKEN_KEY = "erp_auth_token";
const USER_DATA_KEY = "erp_user_data";
const USER_ROLE_KEY = "erp_user_role";

const LEGACY_AUTH_TOKEN_KEY = "authToken";
const LEGACY_STUDENT_DATA_KEY = "studentData";
const LEGACY_USER_DATA_KEY = "userData";
const LEGACY_USER_ROLE_KEY = "userRole";

export type UserRole = "student" | "faculty" | "admin";

export interface AuthUser {
  role: UserRole;
  uniqueId: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export const setAuthSession = (token: string, user: AuthUser): void => {
  if (typeof window === "undefined") return;

  const serializedUser = JSON.stringify(user);

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, serializedUser);
  localStorage.setItem(USER_ROLE_KEY, user.role);

  // Backward compatibility with legacy keys still referenced in some places.
  localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_USER_DATA_KEY, serializedUser);
  localStorage.setItem(LEGACY_STUDENT_DATA_KEY, serializedUser);
  localStorage.setItem(LEGACY_USER_ROLE_KEY, user.role);
};

export const logout = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_DATA_KEY);
  localStorage.removeItem(LEGACY_STUDENT_DATA_KEY);
  localStorage.removeItem(LEGACY_USER_ROLE_KEY);
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY));
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
};

const readJson = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const getUserData = <T = AuthUser>(): T | null => {
  if (typeof window === "undefined") return null;
  return (
    readJson<T>(localStorage.getItem(USER_DATA_KEY)) ??
    readJson<T>(localStorage.getItem(LEGACY_USER_DATA_KEY)) ??
    readJson<T>(localStorage.getItem(LEGACY_STUDENT_DATA_KEY))
  );
};

export const getUserRole = (): UserRole | null => {
  if (typeof window === "undefined") return null;

  const role = localStorage.getItem(USER_ROLE_KEY) || localStorage.getItem(LEGACY_USER_ROLE_KEY);
  if (role === "student" || role === "faculty" || role === "admin") {
    return role;
  }

  const user = getUserData<AuthUser>();
  if (user?.role === "student" || user?.role === "faculty" || user?.role === "admin") {
    return user.role;
  }

  return null;
};

export const storeStudentData = (studentData: unknown): void => {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(studentData);
  localStorage.setItem(USER_DATA_KEY, serialized);
  localStorage.setItem(LEGACY_STUDENT_DATA_KEY, serialized);
};

export const getStudentData = (): unknown => getUserData();
