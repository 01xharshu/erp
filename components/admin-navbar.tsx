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

interface AdminUser {
  name?: string;
  adminId?: string;
  uniqueId?: string;
}

export function AdminNavbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    <header className="sticky top-0 z-30 w-full bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Access:</span>
          <Badge variant="secondary">Administrator</Badge>
        </div>

        <div className="hidden lg:block text-center">
          <h1 className="text-sm font-semibold text-foreground">College ERP Admin Console</h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
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
