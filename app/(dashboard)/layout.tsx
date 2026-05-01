"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { FloatingActionBar } from "@/components/floating-action-bar";
import { ChatbotWidget } from "@/components/chatbot-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMenuPage = pathname === "/menu";

  return (
    <ProtectedRoute requiredRole={["student", "faculty"]}>
      <div className="app-shell-bg app-shell-grid min-h-dvh w-full md:py-6 lg:py-10 md:px-6 lg:px-10 flex">
        <div className="relative w-full max-w-[1600px] mx-auto min-h-dvh md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-5rem)] overflow-hidden bg-background md:bg-card md:rounded-[32px] md:shadow-2xl md:ring-1 md:ring-black/5 dark:md:ring-white/10 flex flex-col">
          <div className="flex flex-1 min-h-full overflow-x-hidden relative">
            <Sidebar />

            <main className="min-w-0 flex-1 md:ml-64 flex flex-col">
              {!isMenuPage && <Navbar />}

              <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-6 transition-all duration-300">
                <div className="w-full max-w-7xl mx-auto">{children}</div>
              </div>
            </main>
          </div>
        </div>
        <FloatingActionBar />
        {pathname !== "/ai-assistant" && <ChatbotWidget />}
      </div>
    </ProtectedRoute>
  );
}
