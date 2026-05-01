"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, History, Maximize2, Send, Sparkles, X, MessageSquare, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAuthToken, getUserRole, isAuthenticated, getUserData } from "@/lib/auth";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ChatRole = "student" | "faculty" | "admin";

type ReminderStatus = "pending" | "notified" | "done";

type ReminderItem = {
  reminderId: string;
  message: string;
  remindAt: string;
  status: ReminderStatus;
};


const initialPromptByRole: Record<ChatRole, string> = {
  student: "Hey there! 👋 I'm your campus assistant. Ask me about your schedule, attendance, fees, or anything else!",
  faculty: "Hello! I can help you with today's classes, attendance logs, student information, or reminders.",
  admin: "Welcome! I can help you with students, attendance summary, fee reports, schedule, or reminders.",
};

const fallbackSuggestions: Record<ChatRole, string[]> = {
  student: ["My profile details", "Today's schedule", "My attendance percentage", "Check pending fees", "When is my next class?"],
  faculty: ["Today's classes", "Have I taken attendance today?", "Set reminder to mark attendance at 9:00 AM", "Students in system"],
  admin: ["Total students", "Attendance summary today", "Set reminder to review fees at 5:00 PM", "Fee summary"],
};


const playReminderTone = () => {
  if (typeof window === "undefined") return;
  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;

  const context = new AudioContextConstructor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
};


interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
}

export function ChatbotWidget() {
  const [role, setRole] = useState<ChatRole>("student");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deliveredRemindersRef = useRef<Set<string>>(new Set());


  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;


  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated()) {
      setMessages([]);
      return;
    }

    const resolvedRole = (getUserRole() || "student") as ChatRole;
    setRole(resolvedRole);

    // Initial greeting if no messages
    if (messagesRef.current.length === 0) {
      setMessages([{ id: "initial-greeting", role: "assistant", content: initialPromptByRole[resolvedRole] }]);
    }
  }, [mounted]);


  useEffect(() => {
    if (!open || !mounted) return;
    fetchSessions();
  }, [open, mounted, role]);

  const fetchSessions = async () => {
    const userData = getUserData();
    if (!userData) return;
    try {
      const res = await fetch(`/api/chat/sessions?userId=${userData.uniqueId}&role=${role}`);
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const loadSession = async (sessionId: string) => {
    setIsLoading(true);
    setView("chat");
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      const data = await res.json();
      if (data && data.messages) {
        // Ensure each message has an ID for React keys
        const mappedMessages = data.messages.map((m: any) => ({
          ...m,
          id: m.id || `hist-${Math.random().toString(36).substring(7)}`,
        }));
        setMessages(mappedMessages);
      }
    } catch (err) {
      toast.error("Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{ id: "initial-greeting", role: "assistant", content: initialPromptByRole[role] }]);
    setCurrentSessionId(null);
    setView("chat");
  };



  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [messages]);

  const sendChat = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoadingRef.current) return;

    const userData = getUserData();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };


    const currentMessages = messagesRef.current;


    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);


    const historyForAPI = [...currentMessages.filter(m => m.id !== "initial-greeting"), userMsg]
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/local-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForAPI,
          role,
          uniqueId: userData?.uniqueId || "anonymous",
          userData,
          fastMode: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }


      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        const createRes = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData?.uniqueId,
            role,
            title: userText.slice(0, 30) + (userText.length > 30 ? "..." : ""),
          }),
        });
        const newSession = await createRes.json();
        activeSessionId = newSession.sessionId;
        setCurrentSessionId(activeSessionId);
        fetchSessions();
      }


      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader available");

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;


        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m)
        );
      }


      if (!fullText.trim()) {
        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId
            ? { ...m, content: "I received your message but couldn't generate a response. Please try again." }
            : m
          )
        );
      } else if (activeSessionId) {
        // Background sync with database once response is fully received
        const currentMsgs = messagesRef.current;
        const finalMessages = currentMsgs.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m);
        
        void fetch(`/api/chat/sessions/${activeSessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: finalMessages }),
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I couldn't process your request. ${error.message?.includes("Ollama") ? "Please make sure Ollama is running locally." : "Please try again."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }

  }, [role]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const value = chatInput;
    setChatInput("");
    sendChat(value);
  };

  const roleBadge = useMemo(() => role.charAt(0).toUpperCase() + role.slice(1), [role]);

  // ── Reminder polling ────────────────────────────────────────────────────
  const markReminderStatus = useCallback(async (token: string, reminderId: string, newStatus: ReminderStatus) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reminderId, status: newStatus }),
      });
    } catch (error) {
      console.error("[v0] Failed to update reminder status:", error);
    }
  }, []);

  const syncDueReminders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 401) return; // Expected if session expired
        throw new Error(`Sync failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (!payload.success || !Array.isArray(payload.data)) return;

      const reminders = payload.data as ReminderItem[];
      const now = Date.now();
      for (const reminder of reminders) {
        if (reminder.status !== "pending") continue;
        const remindAtMs = new Date(reminder.remindAt).getTime();
        if (!Number.isFinite(remindAtMs) || remindAtMs > now) continue;
        if (deliveredRemindersRef.current.has(reminder.reminderId)) continue;

        deliveredRemindersRef.current.add(reminder.reminderId);
        playReminderTone();
        toast.info(`Reminder: ${reminder.message}`);
        void markReminderStatus(token, reminder.reminderId, "notified");
      }
    } catch (error) {
      // Sliently handle network errors to avoid console noise during dev reloads
    }
  }, [markReminderStatus]);

  useEffect(() => {
    if (!mounted) return;

    void syncDueReminders();
    const interval = window.setInterval(() => void syncDueReminders(), 30000);
    return () => window.clearInterval(interval);
  }, [mounted, syncDueReminders]);

  // Don't render anything until mounted
  if (!mounted) return null;

  // ── Render simple Markdown (bold + line breaks) ─────────────────────────
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="fixed right-8 z-50 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-8">
      {open ? (
        <Card className="w-[min(94vw,380px)] border-border/70 shadow-2xl flex flex-col h-[500px] max-h-[70vh] bg-card/95 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b shrink-0 px-3 md:px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Bot className="h-4 w-4 text-primary shrink-0" />
                <span className="text-[13px] font-bold truncate max-w-[90px] md:max-w-none">
                  {view === "chat" ? (BRAND.assistantName === "AI Assistant" ? "Assistant" : BRAND.assistantName) : "History"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {view === "chat" ? (
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:bg-secondary" onClick={() => setView("history")}>
                    <History className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:bg-secondary" onClick={() => setView("chat")}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Button asChild variant="ghost" size="icon" className={cn(
                  "h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5",
                  isLoading && "pointer-events-none opacity-50"
                )}>
                  <Link href={currentSessionId ? `/ai-assistant?sessionId=${currentSessionId}` : "/ai-assistant"}>
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Link>
                </Button>

                <div className="w-[1px] h-4 bg-border/50 mx-0.5 hidden sm:block" />

                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-background/50">
            {view === "chat" ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3" ref={scrollRef}>
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-secondary text-secondary-foreground rounded-bl-none border border-border/50"
                            }`}
                        >
                          {msg.id === "initial-greeting" ? (
                            <div className="flex flex-col gap-2">
                              <p>{msg.content}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {fallbackSuggestions[role].slice(0, 4).map(s => (
                                  <button
                                    key={s}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => {
                                      setChatInput("");
                                      sendChat(s);
                                    }}
                                    className="text-[10px] bg-background/50 border border-border hover:bg-background px-2.5 py-1.5 rounded-full transition-all hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:pointer-events-none"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none border border-border/50 px-4 py-3">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <form
                  id="chatbot-form"
                  className="p-3 border-t bg-background shrink-0 flex items-center gap-2"
                  onSubmit={handleFormSubmit}
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Talk to assistant..."
                    disabled={isLoading}
                    className="rounded-full bg-secondary/50 border-none h-10 shadow-none focus-visible:ring-1 text-xs"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !chatInput.trim()} className="rounded-full h-10 w-10 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-xl h-12 border-dashed border-primary/30 text-primary hover:bg-primary/5"
                    onClick={startNewChat}
                  >
                    <Plus className="h-4 w-4" />
                    Start New Chat
                  </Button>
                  <div className="py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-1">Recent Chats</div>
                  {sessions.length === 0 ? (
                    <div className="py-10 text-center opacity-30 flex flex-col items-center gap-2">
                      <MessageSquare className="h-6 w-6" />
                      <p className="text-[10px] font-medium">No history</p>
                    </div>
                  ) : (
                    sessions.map(s => (
                      <button
                        key={s.sessionId}
                        onClick={() => loadSession(s.sessionId)}
                        className="w-full text-left p-3 rounded-xl border border-transparent hover:border-border hover:bg-secondary/50 transition-all group flex items-center gap-3"
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium truncate flex-1">{s.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          size="lg"
          className="liquid-glass h-14 gap-2 rounded-full px-6 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:saturate-[250%] hover:brightness-[1.1] active:scale-95 group"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 blur-lg bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold tracking-tight text-foreground/90">AI Assistant</span>
        </Button>
      )}
    </div>
  );
}
