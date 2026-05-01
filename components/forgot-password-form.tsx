"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, KeyRound, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
// Removed BRAND import as it is unused

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugCode, setDebugCode] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Please enter your Email or Unique ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Verification code generated!");
        if (data.debugCode) {
          setDebugCode(data.debugCode);
        }
        setStep(2);
      } else {
        toast.error(data.message || "Failed to initiate reset");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code, newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Password reset successful!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
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
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <div className="flex justify-center items-center py-10">
          <Card className="w-full max-w-[430px] border-border/75 bg-card/80 shadow-[0_30px_60px_-35px_rgba(2,6,23,0.75)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="mb-1 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-ring/25 text-primary">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {step === 1 
                  ? "Enter your details to receive a verification code" 
                  : "Enter the code and your new password"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Generating Code..." : "Get Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {debugCode && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">Local Verification Code:</span>
                      </div>
                      <code className="text-sm tracking-widest font-bold text-primary">{debugCode}</code>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Code</label>
                    <Input
                      type="text"
                      placeholder="6 digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isLoading}
                      maxLength={6}
                      className="bg-background/80 text-center tracking-[0.5em] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-background/80"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
