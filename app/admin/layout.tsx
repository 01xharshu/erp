"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, isAuthenticated } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminNavbar } from "@/components/admin-navbar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { AdminMobileBottomNav } from "@/components/admin-mobile-bottom-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as admin
    const role = getUserRole();

    if (!isAuthenticated() || role !== "admin") {
      router.push("/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 min-w-0">
        <AdminNavbar />
        <div className="p-4 pb-24 md:p-6 md:pb-6">{children}</div>
      </main>
      <AdminMobileBottomNav />
      <ChatbotWidget />
    </div>
  );
}
