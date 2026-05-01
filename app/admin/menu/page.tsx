"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  IndianRupee, 
  Settings, 
  ShieldCheck, 
  Megaphone, 
  FileSearch,
  UserPlus,
  ShieldAlert,
  HelpCircle,
  Database,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminItems = [
  { icon: LayoutDashboard, label: "Admin Dashboard", href: "/admin/dashboard", color: "text-blue-600", bg: "bg-blue-500/10" },
  { icon: Users, label: "Manage Students", href: "/admin/students", color: "text-indigo-600", bg: "bg-indigo-500/10" },
  { icon: BookOpen, label: "Manage Faculty", href: "/admin/faculty", color: "text-purple-600", bg: "bg-purple-500/10" },
  { icon: IndianRupee, label: "Manage Fees", href: "/admin/fees", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { icon: Megaphone, label: "Bulletins", href: "/admin/dashboard", color: "text-amber-600", bg: "bg-amber-500/10" },
  { icon: Database, label: "System Health", href: "/admin/dashboard", color: "text-rose-600", bg: "bg-rose-500/10" },
  { icon: UserPlus, label: "Add Admin", href: "/admin/admins", color: "text-cyan-600", bg: "bg-cyan-500/10" },
  { icon: ShieldCheck, label: "Access Control", href: "/admin/admins", color: "text-sky-600", bg: "bg-sky-600/10" },
  { icon: FileSearch, label: "Audit Logs", href: "/admin/dashboard", color: "text-slate-600", bg: "bg-slate-600/10" },
  { icon: ShieldAlert, label: "Security", href: "/admin/dashboard", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Settings, label: "Platform Setup", href: "/admin/settings", color: "text-slate-500", bg: "bg-slate-500/10" },
  { icon: HelpCircle, label: "Support", href: "/admin/dashboard", color: "text-slate-400", bg: "bg-slate-400/10" },
];

export default function AdminMobileMenuPage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Management</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">Platform control center for administrators</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
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
