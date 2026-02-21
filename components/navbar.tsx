"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { logout, getStudentData } from "@/lib/auth";
import { mockNotices } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [unreadNotices, setUnreadNotices] = useState(0);

  useEffect(() => {
    setMounted(true);
    const data = getStudentData();
    setStudentData(data);
    setUnreadNotices(mockNotices.filter((n) => n.isUnread).length);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (!mounted) return null;

  const studentName = studentData?.name || "Student";
  const studentInitials = studentName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between gap-2 px-4 py-3 pl-16 md:pl-4">
        {/* Left - App Info / Semester */}
        <div className="min-w-0">
          <div className="md:hidden">
            <p className="truncate text-sm font-semibold text-foreground">{BRAND.name}</p>
            <p className="truncate text-xs text-muted-foreground">{studentName}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Semester:</span>
            <Badge variant="secondary">
              {studentData?.semester || 3} - {studentData?.year || 2} Year
            </Badge>
          </div>
        </div>

        {/* Center - College Name/Logo */}
        <div className="hidden lg:block text-center">
          <h1 className="text-sm font-semibold text-foreground">
            {BRAND.fullName}
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotices > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotices}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Notifications</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mockNotices.slice(0, 3).map((notice) => (
                    <div
                      key={notice.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        notice.isUnread
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted border-border"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-medium">{notice.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notice.date}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {notice.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/events" className="cursor-pointer">
                  View All Notices
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={studentData?.photoURL} alt={studentName} />
                  <AvatarFallback>{studentInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">{studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {studentData?.enrollmentNo}
                </p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
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
