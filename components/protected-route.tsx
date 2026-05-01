"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole, UserRole } from "@/lib/auth";

export function ProtectedRoute({ 
  children,
  requiredRole
}: { 
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      const userRole = getUserRole();
      
      if (!authStatus) {
        console.log("[v0] Not authenticated, redirecting to login");
        router.push("/login");
      } else if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (userRole && !roles.includes(userRole)) {
          console.log(`[v0] Role mismatch: ${userRole} accessed ${roles.join("/")} route. Redirecting...`);
          if (userRole === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
