/**
 * Application configuration
 * Centralized configuration for the ERP system
 */

export const config = {
  app: {
    name: "College ERP Portal",
    description: "Modern College ERP Student Portal",
    version: "0.1.0",
    author: "Aarav Kumar",
    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },

  features: {
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === "true",
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  },

  auth: {
    tokenKey: "erp_auth_token",
    studentDataKey: "erp_student_data",
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    timeout: 30000, // 30 seconds
  },

  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  theme: {
    defaultTheme: "system",
    enableSwitcher: true,
  },
};
