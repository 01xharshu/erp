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
      <div className="flex min-h-dvh bg-background overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-w-0">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="p-4 pb-24 md:p-6 md:pb-6">{children}</div>
        </main>
        <MobileBottomNav />
        <ChatbotWidget />
      </div>
    </ProtectedRoute>
  );
}
