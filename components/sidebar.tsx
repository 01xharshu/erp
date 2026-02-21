"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  FileText,
  DollarSign,
  Building2,
  Megaphone,
  LogOut,
  Menu,
  X,
  Clock,
  Home,
  GraduationCap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "Subjects", href: "/dashboard/subjects" },
  { icon: Calendar, label: "Timetable", href: "/dashboard/timetable" },
  { icon: BarChart3, label: "Attendance", href: "/dashboard/attendance" },
  { icon: FileText, label: "Results", href: "/dashboard/results" },
  { icon: FileText, label: "Assignments", href: "/dashboard/assignments" },
  { icon: DollarSign, label: "Fees", href: "/dashboard/fees" },
  { icon: Building2, label: "Hostel", href: "/dashboard/hostel" },
  { icon: Home, label: "Library", href: "/dashboard/library" },
  { icon: Megaphone, label: "Events", href: "/dashboard/events" },
  { icon: Clock, label: "Grievance", href: "/dashboard/grievance" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isDemoMode = pathname.startsWith("/demo");

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-[max(0.75rem,env(safe-area-inset-top))] left-4 z-[95]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-full border-border/70 bg-card shadow-sm backdrop-blur dark:bg-card/85"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[88] bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[90] h-full w-64 border-r border-border/70 bg-card backdrop-blur-xl transition-transform duration-300 dark:bg-card/92 md:absolute md:inset-y-0 md:left-0",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="border-b border-border/70 p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-ring/10 to-amber-400/10 p-3">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-foreground">{BRAND.name}</h1>
                <p className="text-[11px] text-muted-foreground">Student Workspace</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="relative flex-1 space-y-1.5 overflow-y-auto p-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 via-ring/15 to-transparent text-primary shadow-sm"
                      : "text-foreground/70 hover:bg-accent/70 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isDemoMode && (
              <>
                <div className="pointer-events-none absolute inset-x-2 bottom-2 top-[46%] rounded-2xl bg-gradient-to-b from-background/0 via-background/55 to-background/95 backdrop-blur-[6px]" />
                <div className="pointer-events-none absolute inset-x-4 top-[58%] rounded-2xl border border-border/75 bg-card p-3 text-center shadow-[0_14px_28px_-20px_rgba(2,6,23,0.75)] backdrop-blur-xl dark:bg-card/82">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/14 text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Demo Preview</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Login to unlock full navigation and module controls.
                  </p>
                </div>
              </>
            )}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-border/70 p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
