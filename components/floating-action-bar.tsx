"use client";

import { useEffect, useState } from "react";
import { Home, Compass, LayoutGrid, Bell, User, Users, IndianRupee, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserRole } from "@/lib/auth";

const studentActions = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: LayoutGrid, label: "Apps", href: "/menu" },
  { icon: Compass, label: "Discover", href: "/dashboard/events" },
  { icon: Bell, label: "Alerts", href: "/dashboard/results" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const adminActions = [
  { icon: ShieldCheck, label: "Manage", href: "/admin/dashboard" },
  { icon: LayoutGrid, label: "Explorer", href: "/admin/menu" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: IndianRupee, label: "Fees", href: "/admin/fees" },
  { icon: User, label: "Profile", href: "/admin/settings" },
];

export function FloatingActionBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const actions = role === "admin" ? adminActions : studentActions;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5 h-16 w-full px-2">
        {actions.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-1 transition-all active:scale-90",
                isActive 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 rounded-b-full bg-primary animate-in fade-in slide-in-from-top-1 duration-300" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
