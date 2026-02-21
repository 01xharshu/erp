"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full hover:bg-accent/10 transition-colors duration-300"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute w-5 h-5 transition-all duration-500 ${
            isDark ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}
        />
        <Moon
          className={`absolute w-5 h-5 transition-all duration-500 ${
            isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"
          }`}
        />
      </div>
    </Button>
  );
}
