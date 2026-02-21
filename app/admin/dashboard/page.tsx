"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, UserPlus, ArrowRight, ShieldCheck, Activity, IndianRupee, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    totalUsers: 0,
    totalCollected: 0,
    pendingFees: 0,
    overdueCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [studentsRes, facultyRes, feesRes] = await Promise.all([
        fetch("/api/admin/students", { headers: getAuthHeaders() }),
        fetch("/api/admin/faculty", { headers: getAuthHeaders() }),
        fetch("/api/admin/fees", { headers: getAuthHeaders() }),
      ]);

      const studentsData = await studentsRes.json();
      const facultyData = await facultyRes.json();
      const feesData = await feesRes.json();
      const studentsCount = studentsData.data?.length || 0;
      const facultyCount = facultyData.data?.length || 0;

      setStats({
        students: studentsCount,
        faculty: facultyCount,
        totalUsers: studentsCount + facultyCount,
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Admin</h1>
        <p className="text-muted-foreground mt-2">
          Manage students, faculty, and platform access from one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">Students + Faculty</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
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

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? "..." : stats.faculty}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active faculty accounts
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <p className="text-xs text-green-600 mt-2">All admin APIs are operational</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{isLoading ? "..." : stats.totalCollected}</div>
            <p className="text-xs text-muted-foreground mt-2">Settled fee amount</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{isLoading ? "..." : stats.pendingFees}</div>
            <p className="text-xs text-muted-foreground mt-2">Outstanding dues</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoading ? "..." : stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Require immediate follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage users and system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Link
              href="/admin/students"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Manage Students</span>
            </Link>
            <Link
              href="/admin/faculty"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Manage Faculty</span>
            </Link>
            <Link
              href="/admin/students"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <UserPlus className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Add New Student</span>
            </Link>
            <Link
              href="/admin/faculty"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <UserPlus className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Add New Faculty</span>
            </Link>
            <Link
              href="/admin/fees"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <IndianRupee className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">Manage Fees</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>Current platform summary and shortcuts</CardDescription>
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
              <Badge variant="secondary">Enabled</Badge>
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
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/students" className="gap-1">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Faculty Management</p>
                  <p className="text-xs text-muted-foreground">Track and update faculty profiles</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/faculty" className="gap-1">
                  Open
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
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/fees" className="gap-1">
                  Review
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
