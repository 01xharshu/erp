// Type definitions for the ERP system

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthToken {
  token: string;
  expiresIn: number;
}

export interface User {
  id: string;
  enrollmentNo: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "faculty" | "admin";
  semester: number;
  year: number;
  photoURL?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type NotificationPriority = "high" | "medium" | "low";
export type FeeStatus = "paid" | "pending" | "overdue";
export type AttendanceStatus = "present" | "absent" | "leave" | "medical" | "other";
export type AssignmentStatus = "pending" | "submitted" | "graded";
export type GrievanceStatus = "open" | "in-progress" | "resolved" | "closed";
