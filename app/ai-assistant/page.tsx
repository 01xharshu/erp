"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  History, 
  Plus, 
  ChevronLeft, 
  Trash2, 
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserRole, isAuthenticated, getUserData } from "@/lib/auth";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { ProtectedRoute } from "@/components/protected-route";

type ChatRole = "student" | "faculty" | "admin";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
}

export default function AIAssistantPage() {
  const [role, setRole] = useState<ChatRole>("student");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // ── Sync Role & Load History ─────────────────────────────────────────────
  useEffect(() => {
    // Check if authenticated
    if (!isAuthenticated()) {
      return; // ProtectedRoute will handle redirect
    }
    const resolvedRole = (getUserRole() || "student") as ChatRole;
    setRole(resolvedRole);
    fetchSessions(resolvedRole);

    // If coming from minimized widget via maximize button, load that session
    const urlParams = new URLSearchParams(window.location.search);
    const passedSessionId = urlParams.get("sessionId");
    if (passedSessionId) {
      loadSession(passedSessionId);
      // Optional: clean up the URL without a page reload
      window.history.replaceState({}, "", "/ai-assistant");
    }
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ── Fetch All Sessions ──────────────────────────────────────────────────
  const fetchSessions = async (activeRole: string) => {
    const userData = getUserData();
    if (!userData) return;

    try {
      const res = await fetch(`/api/chat/sessions?userId=${userData.uniqueId}&role=${activeRole}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // ── Load Specific Session ────────────────────────────────────────────────
  const loadSession = async (sessionId: string) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await res.json();
      if (data && data.messages) {
        setMessages(data.messages.map((m: any) => ({
          ...m,
          id: m.id || Math.random().toString(36).substring(7)
        })));
      }
    } catch (error) {
      toast.error("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Create New Session ──────────────────────────────────────────────────
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setChatInput("");
  };

  // ── Delete Session ──────────────────────────────────────────────────────
  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        if (currentSessionId === sessionId) {
          startNewChat();
        }
        toast.success("Chat deleted");
      }
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  // ── Send Message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userData = getUserData();
    if (!userData) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setChatInput("");

    try {
      // 1. If no current sessionId, create one first
      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        const createRes = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData.uniqueId,
            role,
            title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
          }),
        });
        const newSession = await createRes.json();
        activeSessionId = newSession.sessionId;
        setCurrentSessionId(activeSessionId);
        // Refresh session list
        fetchSessions(role);
      }

      // 2. Call AI API
      const historyForAPI = messagesRef.current.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/local-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForAPI,
          role,
          uniqueId: userData.uniqueId,
          userData,
        }),
      });

      if (!res.ok) throw new Error("AI failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "", createdAt: new Date() }]);

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m));
      }

      // 3. Save full history to session
      const finalMessages = messagesRef.current.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m);
      await fetch(`/api/chat/sessions/${activeSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: finalMessages }),
      });

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, role, isLoading]);

  const renderMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />');
  };

  return (
    <ProtectedRoute requiredRole={["student", "faculty", "admin"]}>
      <div className="flex h-dvh w-full overflow-hidden bg-background relative selection:bg-primary/20">
        
        {/* ── Sidebar: History ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHistoryOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isHistoryOpen ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? '85vw' : 300) : 0, 
          opacity: isHistoryOpen ? 1 : 0,
          translateX: isHistoryOpen ? 0 : -20 
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-[50] lg:relative lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-3xl overflow-hidden shrink-0",
          !isHistoryOpen && "pointer-events-none lg:pointer-events-auto"
        )}
      >
          <div className="p-6 border-b border-border/50 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Chat History
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsHistoryOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 shrink-0">
            <Button 
              onClick={startNewChat}
              className="w-full justify-start gap-2 h-12 rounded-2xl bg-primary text-primary-foreground hover:saturate-150 border-none shadow-lg shadow-primary/20 transition-all font-bold"
            >
              <Plus className="h-4 w-4" />
              New session
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest py-2 px-2">Recent Chats</div>
              {sessions.map(session => (
                <button
                  key={session.sessionId}
                  onClick={() => loadSession(session.sessionId)}
                  className={cn(
                    "w-full group relative flex items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-xs transition-all duration-300",
                    currentSessionId === session.sessionId
                      ? "bg-primary/[0.08] text-primary ring-1 ring-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground active:scale-[0.98]"
                  )}
                >
                  <MessageSquare className={cn("h-4 w-4 shrink-0", currentSessionId === session.sessionId ? "text-primary" : "text-muted-foreground/40")} />
                  <span className="truncate flex-1 font-semibold">{session.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 
                      onClick={(e) => deleteSession(e, session.sessionId)}
                      className="h-3.5 w-3.5 text-destructive/60 hover:text-destructive transition-colors shrink-0" 
                    />
                  </div>
                </button>
              ))}
              {sessions.length === 0 && (
                <div className="py-10 text-center opacity-30 flex flex-col items-center gap-2">
                  <MessageSquare className="h-8 w-8" />
                  <p className="text-[10px] font-medium">No history yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.aside>

        {/* ── Main Chat Area ────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
          
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/40 px-4 md:px-6 flex items-center justify-between bg-background/80 backdrop-blur-md shrink-0 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="flex h-9 w-9 rounded-xl border-border/50 shadow-none hover:bg-secondary/50" 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <History className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/20">
                <Bot className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs md:text-sm font-bold leading-none tracking-tight truncate max-w-[120px] md:max-w-none">{BRAND.assistantName}</h1>
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="rounded-2xl gap-2 text-[10px] md:text-[11px] font-bold h-9 px-3 md:px-4 shadow-sm border border-border/10">
              <Link href="/dashboard">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
          </div>
        </header>

          {/* Message List */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto px-4 py-12 md:px-8">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      className="h-24 w-24 rounded-[32px] bg-gradient-to-tr from-primary to-ring flex items-center justify-center text-primary-foreground shadow-[0_20px_40px_-15px_rgba(var(--primary),0.4)]"
                    >
                      <Sparkles className="h-12 w-12" />
                    </motion.div>
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight italic">
                        Good afternoon.
                      </h2>
                      <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base leading-relaxed font-medium">
                        I am your {BRAND.name} intelligence. Ask me about schedules, attendance, or institution policies.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {fallbackSuggestions[role]?.map(s => (
                        <button 
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="flex items-center gap-3 p-5 text-left text-xs font-bold rounded-2xl border border-border/50 bg-card/50 hover:bg-secondary/50 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm"
                        >
                          <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="flex-1 transition-transform group-hover:translate-x-1">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 pb-40">
                    {messages.map((msg) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={cn(
                          "flex gap-6 group w-full",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-[14px] shrink-0 flex items-center justify-center text-[10px] font-black shadow-lg ring-1 transition-transform duration-500",
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground ring-primary/30 group-hover:scale-110" 
                            : "bg-card text-primary ring-border/50 group-hover:rotate-12"
                        )}>
                          {msg.role === "user" ? "ME" : <Bot className="h-5 w-5" />}
                        </div>
                        <div className={cn(
                          "flex flex-col max-w-[80%] space-y-2.5",
                          msg.role === "user" ? "items-end text-right" : "items-start text-left"
                        )}>
                          <div className={cn(
                            "px-5 py-4 rounded-[24px] text-[14px] leading-relaxed relative",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-tr-none font-medium"
                              : "bg-card border border-border/50 shadow-xl shadow-black/5 rounded-tl-none prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-headings:mb-2"
                          )}>
                            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                          </div>
                          <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest px-2">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-6">
                        <div className="h-10 w-10 rounded-[14px] bg-card flex items-center justify-center ring-1 ring-border/50">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-card border border-border/40 px-5 py-5 rounded-[24px] rounded-tl-none flex gap-2 shadow-xl shadow-black/5">
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="h-2 w-2 rounded-full bg-primary" />
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="h-2 w-2 rounded-full bg-primary" />
                          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Immersive Input Box */}
            <div className="mt-auto px-4 pb-8 pt-0 z-40 bg-gradient-to-t from-background via-background to-transparent">
              <div className="max-w-4xl mx-auto w-full">
                <form 
                  onSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); }}
                  className="relative flex items-end gap-3 p-3 rounded-[32px] border border-border/30 bg-card/60 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-white/10"
                >
                  <div className="flex-1 min-h-[56px] px-5 py-4">
                    <textarea
                      rows={1}
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(chatInput);
                        }
                      }}
                      placeholder="Type a message or ask a question..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm md:text-base resize-none py-1 max-h-[200px] overflow-y-auto scrollbar-hide text-foreground font-medium placeholder:text-muted-foreground/30 leading-snug"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !chatInput.trim()}
                    className="h-12 w-12 rounded-[20px] bg-primary text-primary-foreground hover:saturate-150 transition-all shadow-xl shadow-primary/20 shrink-0 group active:scale-90"
                  >
                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </form>
                <div className="flex items-center justify-center gap-6 mt-4 opacity-50">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-tight uppercase">Enter to send</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground tracking-tight uppercase">Shift + Enter for new line</span>
                </div>
              </div>
            </div>
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}

// Utility to combine class names
// Removed local cn to use global one from @/lib/utils

const fallbackSuggestions: Record<string, string[]> = {
  student: ["My profile details", "Today's schedule", "My attendance percentage", "Check pending fees", "When is my next class?"],
  faculty: ["Today's classes", "Have I taken attendance today?", "Set reminder to mark attendance at 9:00 AM", "Students in system"],
  admin: ["Total students", "Attendance summary today", "Set reminder to review fees at 5:00 PM", "Fee summary"],
};
