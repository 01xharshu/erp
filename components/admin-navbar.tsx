"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, LogOut, Users, BookOpen, IndianRupee } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserData, logout } from "@/lib/auth";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { CommandSearch } from "@/components/command-search";

interface AdminUser {
  name?: string;
  adminId?: string;
  uniqueId?: string;
}

export function AdminNavbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = getUserData<AdminUser>();
    setAdminData(data);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  const adminName = adminData?.name || "Admin";
  const adminUniqueId = adminData?.adminId || adminData?.uniqueId || "ADMIN";
  const initials = adminName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-card/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 px-4 py-3 pl-16 md:px-5 md:pl-5">
        <div className="min-w-0">
          <div className="md:hidden">
            <p className="truncate text-sm font-semibold text-foreground">{BRAND.adminConsoleName}</p>
            <p className="truncate text-xs text-muted-foreground">{adminUniqueId}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Access:</span>
            <Badge variant="secondary" className="bg-secondary/80">Administrator</Badge>
          </div>
        </div>

        <div className="hidden lg:block text-center">
          <h1 className="text-sm font-semibold text-foreground">{BRAND.adminConsoleName}</h1>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <CommandSearch role="admin" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-xl hover:bg-accent/70"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/70">
                <Avatar className="h-8 w-8 border border-border/70">
                  <AvatarFallback>{initials || "A"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">{adminName}</p>
                <p className="text-xs text-muted-foreground">{adminUniqueId}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/admin/students" className="cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/faculty" className="cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Faculty
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/fees" className="cursor-pointer">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Manage Fees
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
