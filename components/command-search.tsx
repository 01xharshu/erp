"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Command,
  FileText,
  GraduationCap,
  Home,
  IndianRupee,
  Search,
  Settings,
  Users,
  UserCircle2,
  Megaphone,
  BarChart3,
  Building2,
  ClipboardList,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AppRole = "student" | "faculty" | "admin";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
  icon: LucideIcon;
};

const studentCommands: CommandItem[] = [
  { id: "home", label: "Dashboard", description: "Open dashboard home", href: "/dashboard", keywords: ["home", "overview"], icon: Home },
  { id: "subjects", label: "Subjects", description: "View subjects list", href: "/dashboard/subjects", keywords: ["courses"], icon: BookOpen },
  { id: "timetable", label: "Timetable", description: "Open weekly schedule", href: "/dashboard/timetable", keywords: ["classes", "schedule"], icon: Calendar },
  { id: "attendance", label: "Attendance", description: "Track attendance records", href: "/dashboard/attendance", keywords: ["present", "absent"], icon: BarChart3 },
  { id: "results", label: "Results", description: "Check exam performance", href: "/dashboard/results", keywords: ["grades", "sgpa", "cgpa"], icon: FileText },
  { id: "assignments", label: "Assignments", description: "Open assignment tracker", href: "/dashboard/assignments", keywords: ["tasks", "work"], icon: ClipboardList },
  { id: "fees", label: "Fees", description: "Open fee ledger and payment", href: "/dashboard/fees", keywords: ["payment", "dues"], icon: IndianRupee },
  { id: "library", label: "Library", description: "View library portal", href: "/dashboard/library", keywords: ["books"], icon: Building2 },
  { id: "events", label: "Events", description: "Read notices and events", href: "/dashboard/events", keywords: ["notice", "announcements"], icon: Megaphone },
  { id: "profile", label: "Profile", description: "Open your profile page", href: "/dashboard/profile", keywords: ["account"], icon: UserCircle2 },
  { id: "settings", label: "Settings", description: "Open app preferences", href: "/dashboard/settings", keywords: ["preferences"], icon: Settings },
];

const adminCommands: CommandItem[] = [
  { id: "admin-home", label: "Admin Dashboard", description: "Open admin overview", href: "/admin/dashboard", keywords: ["admin", "overview"], icon: Home },
  { id: "admin-students", label: "Manage Students", description: "Create and update students", href: "/admin/students", keywords: ["users", "enrollment"], icon: Users },
  { id: "admin-faculty", label: "Manage Faculty", description: "Create and update faculty", href: "/admin/faculty", keywords: ["teachers"], icon: GraduationCap },
  { id: "admin-fees", label: "Manage Fees", description: "Track and update fee status", href: "/admin/fees", keywords: ["payments", "dues"], icon: IndianRupee },
];

const getCommands = (role: AppRole): CommandItem[] => {
  if (role === "admin") return adminCommands;
  return studentCommands;
};

export function CommandSearch({
  role,
  className,
}: {
  role: AppRole;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const commands = useMemo(() => getCommands(role), [role]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((item) => {
      const haystack = [item.label, item.description, item.href, ...item.keywords].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const runCommand = (href: string) => {
    setOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  const submitFirstResult = (event: React.FormEvent) => {
    event.preventDefault();
    if (filteredCommands.length > 0) {
      runCommand(filteredCommands[0].href);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn("hidden min-w-[280px] items-center justify-between gap-3 rounded-full border-border/75 bg-background/86 px-4 text-muted-foreground md:inline-flex", className)}
      >
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          Search anything...
        </span>
        <kbd className="rounded-md border border-border/80 bg-muted/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <Command className="mr-0.5 inline h-3 w-3" />
          K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl overflow-hidden border-border/75 bg-card/96 p-0 backdrop-blur-2xl">
          <form onSubmit={submitFirstResult} className="border-b border-border/70 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a command or page..."
                className="h-11 border-border/70 bg-background/80 pl-9"
              />
            </div>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                No command found for &quot;{query}&quot;.
              </div>
            ) : (
              filteredCommands.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => runCommand(item.href)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-border/70 hover:bg-accent/50"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 rounded-lg border border-border/70 bg-background/80 p-1.5">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{item.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                      </span>
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px]">
                        Current
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/70 px-4 py-2 text-[11px] text-muted-foreground">
            <span>Enter to open first result</span>
            <span className="hidden sm:inline">Use Cmd/Ctrl + K to reopen</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
