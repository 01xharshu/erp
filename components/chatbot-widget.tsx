"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getAuthToken, getUserRole } from "@/lib/auth";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

type ChatRole = "student" | "faculty" | "admin";
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type ReminderStatus = "pending" | "notified" | "done";

type ReminderItem = {
  reminderId: string;
  message: string;
  remindAt: string;
  status: ReminderStatus;
};

const initialPromptByRole: Record<ChatRole, string> = {
  student: "Ask me about your schedule, attendance, fees, or reminders.",
  faculty: "Ask me about today's classes, attendance logs, students, or reminders.",
  admin: "Ask me about students, attendance summary, fees, schedule, or reminders.",
};

const fallbackSuggestions: Record<ChatRole, string[]> = {
  student: ["Today's schedule", "My attendance today", "Set reminder to submit assignment at 6:30 PM", "Pending fees"],
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

const formatReminderTime = (value: string): string => {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function ChatbotWidget() {
  const [role, setRole] = useState<ChatRole>("student");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const deliveredRemindersRef = useRef<Set<string>>(new Set());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: initialPromptByRole.student,
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(fallbackSuggestions.student);

  useEffect(() => {
    setMounted(true);
    const resolvedRole = (getUserRole() || "student") as ChatRole;
    setRole(resolvedRole);
    setSuggestions(fallbackSuggestions[resolvedRole]);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ ...prev[0], text: initialPromptByRole[resolvedRole] }];
      }
      return prev;
    });
  }, []);

  const roleBadge = useMemo(() => role.charAt(0).toUpperCase() + role.slice(1), [role]);

  const markReminderStatus = useCallback(async (token: string, reminderId: string, status: ReminderStatus) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reminderId, status }),
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            role: "assistant",
            text: `Reminder alert: ${reminder.message} (${formatReminderTime(reminder.remindAt)})`,
          },
        ]);
        void markReminderStatus(token, reminder.reminderId, "notified");
      }
    } catch (error) {
      console.error("[v0] Failed to sync reminders:", error);
    }
  }, [markReminderStatus]);

  useEffect(() => {
    if (!mounted) return;

    void syncDueReminders();
    const interval = window.setInterval(() => {
      void syncDueReminders();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [mounted, syncDueReminders]);

  if (!mounted) {
    return null;
  }

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, nextUserMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });
      const payload = await response.json();

      if (!payload.success) {
        throw new Error(payload.message || "Unable to fetch chatbot response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: String(payload.data?.reply || "No response."),
        },
      ]);

      const nextSuggestions = Array.isArray(payload.data?.suggestions)
        ? payload.data.suggestions.map((entry: unknown) => String(entry))
        : [];
      setSuggestions(nextSuggestions.length ? nextSuggestions : fallbackSuggestions[role]);

      // Refresh due reminders after commands like "set reminder ..."
      void syncDueReminders();
    } catch (error) {
      console.error("[v0] Chatbot request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "I couldn't process that request right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed right-4 z-50 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-4">
      {open ? (
        <Card className="w-[min(94vw,380px)] border-border/70 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                {BRAND.assistantName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {roleBadge}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <ScrollArea className="h-72 rounded-md border border-border/60 p-3">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => sendMessage(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about schedule, attendance, fees, reminders..."
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button type="button" onClick={() => setOpen(true)} size="lg" className="h-12 gap-2 rounded-full px-4 shadow-lg">
          <Sparkles className="h-4 w-4" />
          Assistant
        </Button>
      )}
    </div>
  );
}
