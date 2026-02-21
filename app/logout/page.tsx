"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout();
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Logging out...
    </div>
  );
}
