"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 dark:from-background dark:to-secondary/10">
      {/* Debug banner */}
      <div className="fixed top-4 left-4 bg-green-600 text-white p-4 z-[9999] rounded-xl font-bold shadow-xl">
        PHASE 1 LOADED – NAVIGATION WORKING
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 dark:bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">College ERP</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Empty hero just to confirm layout */}
      <div className="pt-32 text-center">
        <h1 className="text-5xl font-bold text-foreground">College ERP</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Loading components one by one...
        </p>
      </div>
    </div>
  );
}