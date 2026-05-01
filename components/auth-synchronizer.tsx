"use client";
import { syncAuthWithContext } from "@/lib/auth";
import { ReactNode } from "react";

export function AuthSynchronizer({ 
  session, 
  token, 
  children 
}: { 
  session: any; 
  token: string | null; 
  children: ReactNode 
}) {
  // Synchronously update the module-level auth state before children render
  syncAuthWithContext(session, token);
  
  return <>{children}</>;
}
