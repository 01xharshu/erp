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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
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
