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
  X,
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

import { Sparkles, Loader2, ArrowUpRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const commands = useMemo(() => getCommands(role), [role]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands.slice(0, 5);
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
      setMessages([]);
    }
  }, [open]);

  const runCommand = (href: string) => {
    setOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || aiLoading) return;
    
    setAiLoading(true);
    const newMsg = { role: "user", content: `Context search for: ${query}` };
    setMessages([newMsg]);
    
    try {
      const res = await fetch("/api/local-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [newMsg],
          role: role,
          fastMode: true
        })
      });
      
      const data = await res.json();
      if (data.response) {
        setMessages([newMsg, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([newMsg, { role: "assistant", content: "Failed to connect to AI service." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const lastAiResponse = useMemo(() => {
    const assistantMessages = messages.filter(m => m.role === "assistant");
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].content : null;
  }, [messages]);

  if (!mounted) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden min-w-[240px] items-center justify-between gap-3 rounded-full border border-border bg-secondary/30 py-2.5 px-4 text-muted-foreground md:inline-flex",
          "hover:bg-secondary/60 hover:text-foreground transition-all duration-300 group",
          className
        )}
      >
        <span className="inline-flex items-center gap-2.5">
          <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium tracking-tight">Search or ask AI...</span>
        </span>
        <kbd className="rounded-lg border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-foreground/40 uppercase tracking-widest shadow-inner">
          <Command className="mr-0.5 inline h-2.5 w-2.5 align-middle opacity-60" />
          K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl overflow-hidden border-none bg-transparent p-0 shadow-none ring-0 focus-visible:ring-0 top-[20%] translate-y-0">
          <div className="bg-card m-1 rounded-[32px] overflow-hidden shadow-2xl border border-border">
            <div className="relative border-b border-border p-4 px-6">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-primary opacity-80" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (filteredCommands.length > 0 && query.length < 5) {
                        runCommand(filteredCommands[0].href);
                      } else {
                        handleAiSearch(e as any);
                      }
                    }
                  }}
                  placeholder="Ask AI or type a command..."
                  className="h-12 border-none bg-transparent p-0 text-lg font-medium placeholder:text-muted-foreground/40 focus-visible:ring-0 shadow-none ring-0"
                />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent rounded-full px-3 text-[10px] tracking-widest shrink-0">
                    Smart
                  </Badge>
                  {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
              {/* AI Wisdom Section */}
              {(lastAiResponse || aiLoading) && (
                <div className="mx-1 rounded-2xl bg-primary/10 border border-primary/20 p-5 space-y-3 relative group">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{BRAND.assistantName} Insights</span>
                  </div>
                  {aiLoading && !lastAiResponse ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground italic">
                      Checking records...
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed font-medium text-foreground/90 whitespace-pre-wrap">
                      {lastAiResponse}
                    </p>
                  )}
                  {!aiLoading && lastAiResponse && (
                     <div className="flex justify-end pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest gap-1 hover:bg-primary/10" onClick={() => setOpen(false)}>
                          Got it <X className="h-3 w-3" />
                        </Button>
                     </div>
                  )}
                </div>
              )}

              {/* Navigation Suggestions */}
              <div className="space-y-1.5 pt-1">
                <div className="px-3 pb-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Navigation & Commands</span>
                </div>
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground/60">
                    No matching pages found.
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
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-300",
                          "hover:bg-white/10 hover:border-white/10 group active:scale-[0.985]"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="rounded-xl bg-white/5 border border-white/10 p-2 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                            <Icon className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">{item.label}</span>
                            <span className="mt-1 block truncate text-xs font-medium text-muted-foreground/70">{item.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {isCurrent ? (
                             <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary/80">
                               Location
                             </Badge>
                           ) : (
                             <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                           )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              <div className="flex gap-4">
                 <span className="flex items-center gap-1.5"><kbd className="rounded bg-white/10 px-1 py-0.5 border border-white/10">⏎</kbd> Navigate</span>
                 <span className="flex items-center gap-1.5"><kbd className="rounded bg-white/10 px-1 py-0.5 border border-white/10">ESC</kbd> Close</span>
              </div>
              <span className="hidden sm:inline italic">Search results from campus knowledge base</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

