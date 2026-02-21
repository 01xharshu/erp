import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="app-shell-bg app-shell-grid min-h-dvh p-2 md:p-4">
        <div className="relative mx-auto min-h-[calc(100dvh-1rem)] max-w-[1600px] overflow-hidden rounded-[30px] border border-border/75 bg-background/92 shadow-[0_24px_65px_-42px_rgba(2,6,23,0.75)] backdrop-blur-xl md:min-h-[calc(100dvh-2rem)]">
          <div className="flex min-h-full overflow-x-hidden">
            <Sidebar />

            <main className="min-w-0 flex-1 md:ml-64">
              <Navbar />

              <div className="p-3 pb-24 md:p-5 md:pb-6">
                <div className="app-content-surface mx-auto w-full max-w-[1280px]">{children}</div>
              </div>
            </main>
          </div>
        </div>
        <MobileBottomNav />
        <ChatbotWidget />
      </div>
    </ProtectedRoute>
  );
}
