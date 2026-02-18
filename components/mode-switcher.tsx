import { UserMode, useMode } from "@/lib/mode-context";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen, Briefcase } from "lucide-react";

export function ModeSwitcher() {
  const { mode, setMode } = useMode();

  const modes: { value: UserMode; label: string; icon: React.ReactNode }[] = [
    { value: "student", label: "Student", icon: <BookOpen className="w-4 h-4" /> },
    { value: "faculty", label: "Faculty", icon: <Briefcase className="w-4 h-4" /> },
    { value: "admin", label: "Admin", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      {modes.map((m) => (
        <Button
          key={m.value}
          variant={mode === m.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode(m.value)}
          className="gap-2 h-8"
          title={`Switch to ${m.label} mode`}
        >
          {m.icon}
          <span className="hidden sm:inline">{m.label}</span>
        </Button>
      ))}
    </div>
  );
}
