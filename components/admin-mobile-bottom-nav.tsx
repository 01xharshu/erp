"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, Users, BookOpen, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Home",
    icon: Home,
    match: (pathname) => pathname === "/admin/dashboard",
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: Users,
    match: (pathname) => pathname.startsWith("/admin/students"),
  },
  {
    href: "/admin/faculty",
    label: "Faculty",
    icon: BookOpen,
    match: (pathname) => pathname.startsWith("/admin/faculty"),
  },
  {
    href: "/admin/fees",
    label: "Fees",
    icon: IndianRupee,
    match: (pathname) => pathname.startsWith("/admin/fees"),
  },
];

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[max(0.25rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-0.9rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/75 bg-card/96 p-1.5 shadow-[0_18px_40px_-25px_rgba(2,6,23,0.75)] backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium leading-none transition-all",
                  isActive
                    ? "bg-gradient-to-b from-primary/18 to-ring/12 text-primary"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                )}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" />
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
