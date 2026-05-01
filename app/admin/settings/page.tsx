"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, UserCog, Lock, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";

export default function AdminSettings() {
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGlobalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!confirm("Are you sure you want to OVERRIDE this user's password? This action is immediate.")) {
      return;
    }

    setIsSubmitting(true);
    const token = getAuthToken();

    try {
      const response = await fetch("/api/admin/global-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ identifier, newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setIdentifier("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          Admin Security & Global Access
        </h1>
        <p className="text-muted-foreground">
          Perform administrative overrides and security management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <UserCog className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Global Password Reset</CardTitle>
                  <CardDescription>
                    Immediately override the password for any Student, Faculty, or Admin account.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleGlobalReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Search className="h-3.5 w-3.5" />
                    Target User (Email or ID)
                  </label>
                  <Input 
                    placeholder="e.g. EN2024001 or principal@college.ac.in" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      New Password
                    </label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Confirm Password
                    </label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="w-full mt-2 font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "RESET PASSWORD IMMEDIATELY"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-primary/5 border-primary/20">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Security Note</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-xs leading-relaxed text-muted-foreground">
                 Administrative password resets are logged for security audits. Use this feature only when a user has lost access and the standard reset process is unavailable.
               </p>
             </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/10">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 Admin Privileges
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ul className="text-xs space-y-2 text-foreground/80">
                 <li>• Global password override</li>
                 <li>• Clear verification codes</li>
                 <li>• Update system policies</li>
                 <li>• Manage all collections</li>
               </ul>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
