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
      <div className="app-shell-bg app-shell-grid min-h-screen w-full flex items-center justify-center text-foreground">
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
    <div className="app-shell-bg app-shell-grid min-h-dvh p-2 md:p-4">
      <div className="relative mx-auto min-h-[calc(100dvh-1rem)] max-w-[1600px] overflow-hidden rounded-[30px] border border-border/75 bg-background/92 shadow-[0_24px_65px_-42px_rgba(2,6,23,0.75)] backdrop-blur-xl md:min-h-[calc(100dvh-2rem)]">
        <div className="flex min-h-full overflow-x-hidden">
          <AdminSidebar />
          <main className="min-w-0 flex-1 md:ml-64">
            <AdminNavbar />
            <div className="p-3 pb-24 md:p-5 md:pb-6">
              <div className="app-content-surface mx-auto w-full max-w-[1280px]">{children}</div>
            </div>
          </main>
        </div>
      </div>
      <AdminMobileBottomNav />
      <ChatbotWidget />
    </div>
  );
}
