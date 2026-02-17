import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time to readable string
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(marks: number, totalMarks: number): number {
  if (totalMarks === 0) return 0;
  return Math.round((marks / totalMarks) * 100);
}

/**
 * Get grade from percentage
 */
export function getGradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "F";
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Calculate CGPA
 */
export function calculateCGPA(results: Array<{ credits: number; grade: string }>): number {
  const gradePoints: { [key: string]: number } = {
    "A+": 4.0,
    A: 3.9,
    "B+": 3.7,
    B: 3.3,
    C: 3.0,
    F: 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  results.forEach((result) => {
    const points = gradePoints[result.grade] || 0;
    totalPoints += points * result.credits;
    totalCredits += result.credits;
  });

  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}

/**
 * Parse enrollment number to extract year
 */
export function getYearFromEnrollment(enrollmentNo: string): number {
  const year = parseInt(enrollmentNo.substring(2, 4));
  return 2000 + year;
}

/**
 * Get attendance percentage
 */
export function getAttendancePercentage(
  attendance: Array<{ status: string }>
): number {
  if (attendance.length === 0) return 0;
  const presentCount = attendance.filter((a) => a.status === "P").length;
  return Math.round((presentCount / attendance.length) * 100);
}
