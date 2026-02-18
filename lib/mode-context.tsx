"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserMode = "student" | "admin" | "faculty";

interface ModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children, initialMode = "student" }: { children: ReactNode; initialMode?: UserMode }) {
  const [mode, setMode] = useState<UserMode>(initialMode);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return context;
}

export function useModeVisibility(visibleIn: UserMode[]) {
  const { mode } = useMode();
  return visibleIn.includes(mode);
}
