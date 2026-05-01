"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  FileText, 
  DollarSign, 
  Building2, 
  Megaphone, 
  Clock, 
  Home,
  UserCircle,
  HelpCircle,
  Settings,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: BookOpen, label: "Subjects", href: "/dashboard/subjects", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { icon: Calendar, label: "Timetable", href: "/dashboard/timetable", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: BarChart3, label: "Attendance", href: "/dashboard/attendance", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: FileText, label: "Results", href: "/dashboard/results", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: FileText, label: "Assignments", href: "/dashboard/assignments", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: DollarSign, label: "Fees", href: "/dashboard/fees", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Building2, label: "Hostel", href: "/dashboard/hostel", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Home, label: "Library", href: "/dashboard/library", color: "text-sky-500", bg: "bg-sky-500/10" },
  { icon: Megaphone, label: "Events", href: "/dashboard/events", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Clock, label: "Grievance", href: "/dashboard/grievance", color: "text-slate-500", bg: "bg-slate-500/10" },
  { icon: Sparkles, label: "AI Assistant", href: "/ai-assistant", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: UserCircle, label: "Profile", href: "/dashboard/profile", color: "text-blue-600", bg: "bg-blue-600/10" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "text-slate-600", bg: "bg-slate-600/10" },
  { icon: HelpCircle, label: "Support", href: "/dashboard/support", color: "text-slate-400", bg: "bg-slate-400/10" },
];

export default function MobileMenuPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("erp_user_role") || localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === "faculty" && (item.label === "Fees" || item.label === "Hostel" || item.label === "Library")) {
      return false; // hide these from faculty
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full border-border/50 bg-background/50 backdrop-blur-sm shadow-sm transition-all hover:bg-background/80 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Explorer</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">Find everything you need right here</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center justify-center gap-4 rounded-[32px] bg-card border border-border p-6 shadow-sm transition-all active:scale-95 hover:border-primary/20 hover:bg-primary/5"
            >
              <div className={cn("flex items-center justify-center h-14 w-14 rounded-[22px] transition-transform group-hover:scale-110", item.bg)}>
                <Icon className={cn("h-7 w-7", item.color)} />
              </div>
              <span className="text-sm font-bold text-center text-foreground/80 group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
