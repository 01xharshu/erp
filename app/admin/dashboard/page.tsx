"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, facultyRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/faculty"),
      ]);

      const studentsData = await studentsRes.json();
      const facultyData = await facultyRes.json();

      setStats({
        students: studentsData.data?.length || 0,
        faculty: facultyData.data?.length || 0,
      });
    } catch (error) {
      console.error("[v0] Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage students and faculty members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.students}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active student accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.faculty}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active faculty accounts
            </p>
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/admin/students" className="block">
              <div className="p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Manage Students
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove students
                    </p>
                  </div>
                </div>
              </div>
            </a>

            <a href="/admin/faculty" className="block">
              <div className="p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Manage Faculty
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, or remove faculty members
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Database</p>
              <p className="font-medium text-foreground">MongoDB</p>
            </div>
            <div>
              <p className="text-muted-foreground">Authentication</p>
              <p className="font-medium text-foreground">Secure Hash</p>
            </div>
            <div>
              <p className="text-muted-foreground">API Status</p>
              <p className="font-medium text-green-600">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
