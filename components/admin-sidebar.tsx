"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, LogOut, IndianRupee, ShieldCheck, ShieldAlert, Calendar, ClipboardList, UserPlus, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShieldCheck, label: "Admins", href: "/admin/admins" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: BookOpen, label: "Faculty", href: "/admin/faculty" },
  { icon: IndianRupee, label: "Fees", href: "/admin/fees" },
  { icon: IndianRupee, label: "Salary", href: "/admin/salary" },
  { icon: ClipboardList, label: "Attendance", href: "/admin/attendance" },
  { icon: Calendar, label: "Timetable", href: "/admin/timetable" },
  { icon: UserPlus, label: "Admissions", href: "/admin/admissions" },
  { icon: Bus, label: "Transport", href: "/admin/bus" },
  { icon: ShieldAlert, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-sidebar", handleOpen);
    return () => window.removeEventListener("open-sidebar", handleOpen);
  }, []);

  return (
    <>


      {isOpen && (
        <div
          className="fixed inset-0 z-[88] bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 z-40 h-dvh w-64 border-r md:border-transparent border-border bg-card transition-transform duration-500 ease-in-out",
          "md:absolute md:inset-y-0 md:h-auto shadow-[1px_0_10px_rgba(0,0,0,0.03)] focus-within:outline-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="border-b border-border p-5 shrink-0 bg-transparent">
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/50 p-3">
              <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-foreground text-base font-bold leading-none tracking-tight">{BRAND.name}</h1>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Admin Ops</p>
              </div>
            </div>
          </div>

          <nav className="relative flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-primary font-semibold bg-primary/[0.04]"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className={cn("h-[18px] w-[18px] transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Pinned at bottom left */}
          <div className="p-4 shrink-0 bg-transparent mt-auto border-t border-border pb-6 md:pb-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl border border-transparent text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            >
              <div className="rounded-lg bg-destructive/10 p-1.5">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-tight">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
