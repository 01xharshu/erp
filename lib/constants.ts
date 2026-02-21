// Application constants
import { BRAND } from "@/lib/brand";

export const APP_NAME = BRAND.fullName;
export const APP_DESCRIPTION = BRAND.description;

// Routes
export const ROUTES = {
  // Auth routes
  LOGIN: "/login",
  LOGOUT: "/logout",
  
  // Dashboard routes
  DASHBOARD: "/dashboard",
  SUBJECTS: "/dashboard/subjects",
  TIMETABLE: "/dashboard/timetable",
  ATTENDANCE: "/dashboard/attendance",
  RESULTS: "/dashboard/results",
  ASSIGNMENTS: "/dashboard/assignments",
  FEES: "/dashboard/fees",
  HOSTEL: "/dashboard/hostel",
  LIBRARY: "/dashboard/library",
  EVENTS: "/dashboard/events",
  GRIEVANCE: "/dashboard/grievance",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: "/api/auth",
  STUDENT_PROFILE: "/api/student/profile",
  SUBJECTS: "/api/subjects",
  ATTENDANCE: "/api/attendance",
  ASSIGNMENTS: "/api/assignments",
  RESULTS: "/api/results",
  FEES: "/api/fees",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "erp_auth_token",
  STUDENT_DATA: "erp_student_data",
  THEME_PREFERENCE: "erp_theme_preference",
  USER_PREFERENCES: "erp_user_preferences",
};

// Grade points mapping
export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 3.9,
  "B+": 3.7,
  B: 3.3,
  C: 3.0,
  D: 2.0,
  F: 0.0,
};

// Attendance status labels
export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  P: "Present",
  A: "Absent",
  L: "Leave",
  M: "Medical Leave",
  O: "Other",
};

// Fee status badges
export const FEE_STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Overdue: "bg-red-100 text-red-800",
};

// Assignment status colors
export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-blue-100 text-blue-800",
  Submitted: "bg-yellow-100 text-yellow-800",
  Graded: "bg-green-100 text-green-800",
};

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 100,
};

// Time related
export const TIME_ZONES = [
  "Asia/Kolkata (IST)",
  "Asia/Bangkok (ICT)",
  "Asia/Manila (PHT)",
];

// API timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Session timeout
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
