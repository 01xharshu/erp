"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserMode, ModeProvider } from "@/lib/mode-context";
import { ModeSwitcher } from "@/components/mode-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ModeAwareContent } from "@/components/mode-aware-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function DemoContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") as UserMode;
  const initialMode = (["student", "faculty", "admin"].includes(modeParam) ? modeParam : "student") as UserMode;

  return (
    <ModeProvider initialMode={initialMode}>
      <div className="min-h-screen bg-background">
        {/* Header Bar */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 pl-16 md:pl-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-lg font-bold">Demo Mode</h1>
              <p className="text-xs text-muted-foreground">Explore features by role</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ThemeToggle />
              <ModeSwitcher />
              <Link href="/">
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          <Sidebar />
          <div className="flex-1 md:ml-64 min-w-0">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ModeAwareContent />
            </main>
          </div>
        </div>
      </div>
    </ModeProvider>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading demo...</div>}>
      <DemoContent />
    </Suspense>
  );
}
