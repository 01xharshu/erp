"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { setAuthSession } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (!data.user || !data.token) {
          toast.error("Invalid auth response from server");
          return;
        }

        setAuthSession(data.token, data.user);
        
        toast.success("Login successful!");
        
        // Add delay for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("[v0] Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(14,165,233,0.2),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.14),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 app-shell-grid opacity-40" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-4 flex w-full items-center justify-start">
          <Button asChild variant="ghost" className="justify-start gap-2 px-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_430px]">
  

          <Card className="w-full border-border/75 bg-card/80 shadow-[0_30px_60px_-35px_rgba(2,6,23,0.75)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="mb-1 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-ring/25 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">{BRAND.fullName}</CardTitle>
              <CardDescription className="text-center">
                Login with Email or Unique ID
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" />
                    Email or Unique ID
                  </label>
                  <Input
                    type="text"
                    placeholder="EN2024001 or admin@college.ac.in"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/80"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-background/80 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border/70 pt-4 text-center text-xs text-muted-foreground">
                <p>For support, contact IT Support at {BRAND.supportEmail}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
