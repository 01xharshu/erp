// Authentication utilities for the ERP system using localStorage

const AUTH_TOKEN_KEY = "erp_auth_token";
const STUDENT_DATA_KEY = "erp_student_data";

export interface AuthCredentials {
  enrollmentNo: string;
  password: string;
}

// Mock credentials for demo
const MOCK_CREDENTIALS = {
  enrollmentNo: "EN2024001",
  password: "password123",
};

export const login = (credentials: AuthCredentials): boolean => {
  if (
    credentials.enrollmentNo === MOCK_CREDENTIALS.enrollmentNo &&
    credentials.password === MOCK_CREDENTIALS.password
  ) {
    // Store auth token
    const token = btoa(
      `${credentials.enrollmentNo}:${Date.now()}`
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return true;
    }
  }
  return false;
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(STUDENT_DATA_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const storeStudentData = (studentData: unknown): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(studentData));
  }
};

export const getStudentData = (): unknown => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STUDENT_DATA_KEY);
  return data ? JSON.parse(data) : null;
};
