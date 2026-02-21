"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { BarChart3, Calendar, Home, BookOpen, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
    match: (pathname) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/timetable",
    label: "Classes",
    icon: Calendar,
    match: (pathname) => pathname.startsWith("/dashboard/timetable"),
  },
  {
    href: "/dashboard/attendance",
    label: "Attendance",
    icon: BarChart3,
    match: (pathname) => pathname.startsWith("/dashboard/attendance"),
  },
  {
    href: "/dashboard/fees",
    label: "Fees",
    icon: IndianRupee,
    match: (pathname) => pathname.startsWith("/dashboard/fees"),
  },
  {
    href: "/dashboard/subjects",
    label: "Subjects",
    icon: BookOpen,
    match: (pathname) => pathname.startsWith("/dashboard/subjects"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
