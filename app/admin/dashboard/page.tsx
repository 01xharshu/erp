"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, UserPlus, ArrowRight, ShieldCheck, Activity, IndianRupee, AlertTriangle, BrainCircuit, RefreshCw, Calendar } from "lucide-react";
import { getAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    admins: 0,
    totalUsers: 0,
    totalCollected: 0,
    pendingFees: 0,
    overdueCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleAISync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing AI Knowledge Base... This may take a few seconds.");
    try {
      const res = await fetch("/api/admin/ai-sync", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: toastId });
      } else {
        toast.error("Sync failed: " + data.error, { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to connect to sync API", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const [studentsRes, facultyRes, adminsRes, feesRes] = await Promise.all([
        fetch("/api/admin/students", { headers: getAuthHeaders() }),
        fetch("/api/admin/faculty", { headers: getAuthHeaders() }),
        fetch("/api/admin/admins", { headers: getAuthHeaders() }),
        fetch("/api/admin/fees", { headers: getAuthHeaders() }),
      ]);

      const [studentsData, facultyData, adminsData, feesData] = await Promise.all([
        studentsRes.json(),
        facultyRes.json(),
        adminsRes.json(),
        feesRes.json(),
      ]);
      const studentsCount = studentsData.data?.length || 0;
      const facultyCount = facultyData.data?.length || 0;
      const adminsCount = adminsData.data?.length || 0;

      setStats({
        students: studentsCount,
        faculty: facultyCount,
        admins: adminsCount,
        totalUsers: studentsCount + facultyCount + adminsCount,
        totalCollected: feesData.summary?.totalCollected || 0,
        pendingFees: feesData.summary?.totalPending || 0,
        overdueCount: feesData.summary?.overdueCount || 0,
      });
    } catch (error) {
      console.error("[v0] Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-amber-400/10 p-5">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Welcome back, Admin</h1>
        <p className="text-muted-foreground mt-2">
          Manage students, faculty, and platform access from one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">Students + Faculty</p>
          </CardContent>
        </Card>

        <Link href="/admin/students" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.students}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active student accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/faculty" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.faculty}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Staff accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/admins" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.admins}</div>
              <p className="text-xs text-muted-foreground mt-2">
                System managers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <p className="text-xs text-green-600 mt-2">All admin APIs are operational</p>
          </CardContent>
        </Card>

        <Link href="/admin/fees" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{isLoading ? "..." : stats.totalCollected}</div>
              <p className="text-xs text-muted-foreground mt-2">Settled fee amount</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/fees?filter=pending" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">₹{isLoading ? "..." : stats.pendingFees}</div>
              <p className="text-xs text-muted-foreground mt-2">Outstanding dues</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/fees?filter=overdue" className="transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl block">
          <Card className="h-full border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{isLoading ? "..." : stats.overdueCount}</div>
              <p className="text-xs text-muted-foreground mt-2">Require immediate follow-up</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage users and system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/admin/students"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Students</span>
            </Link>
            <Link
              href="/admin/faculty"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Faculty</span>
            </Link>
            <Link
              href="/admin/fees"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <IndianRupee className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Fees</span>
            </Link>
            <Link
              href="/admin/timetable"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Timetable</span>
            </Link>
            <Link
              href="/admin/students?action=add"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <UserPlus className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Add Student</span>
            </Link>
            <Link
              href="/admin/faculty?action=add"
              className="flex flex-col items-center gap-2 rounded-xl border border-border/75 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10"
            >
              <UserPlus className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Add Faculty</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current platform status and summaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Admin Access Control</p>
                    <p className="text-xs text-muted-foreground">Role-based authorization enabled</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">Active</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">User Records</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? "Loading..." : `${stats.totalUsers} managed accounts`}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg h-8">
                  <Link href="/admin/students" className="gap-1">
                    Manage
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-foreground">Fee Escalations</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? "Loading..." : `${stats.overdueCount} overdue fee item(s)`}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg h-8">
                  <Link href="/admin/fees" className="gap-1">
                    Review
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Intelligence Center
            </CardTitle>
            <CardDescription>
              Sync system knowledge with the AI Assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-background/50 border border-primary/10">
              <p className="text-xs leading-relaxed text-muted-foreground">
                The AI Assistant uses a locally cached knowledge base of students, faculty, and schedules. 
                <span className="block mt-2 font-bold text-foreground">Important:</span> Sync manually after adding new users or changing timetables to ensure AI responses are accurate.
              </p>
            </div>
            
            <Button 
              className="w-full gap-2 rounded-xl h-11 shadow-lg shadow-primary/20" 
              onClick={handleAISync}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing Logic..." : "Sync AI Knowledge Base"}
            </Button>
            
            {isSyncing && (
              <p className="text-[10px] text-center text-primary animate-pulse font-medium">
                Generating embeddings for system data...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
