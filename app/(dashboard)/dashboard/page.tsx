"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
import { mockStudent, mockNotices, calculateAttendancePercentage, mockExamResults, mockFees } from "@/lib/mockData";
import { getStudentData } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const data = getStudentData();
    setStudentData(data || mockStudent);
  }, []);

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const attendancePercentage = calculateAttendancePercentage();

  // Use mockExamResults to compute current SGPA (now used!)
  const getCurrentSGPA = () => {
    if (!mockExamResults || mockExamResults.length === 0) return 7.85; // fallback

    const studentSemester = studentData.semester ?? 0; // safe access with fallback

    // Filter results for current semester (with safe property access)
    const latestResults = mockExamResults
      .filter((r: any) => (r as any)?.semester === studentSemester) // type assertion + optional chaining
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (latestResults.length > 0) {
      return (latestResults[0] as any)?.sgpa ?? 7.85; // safe access
    }

    return 7.85;
  };

  const currentSGPA = getCurrentSGPA();

  const pendingFees = mockFees
    .filter((f) => f.status === "Pending")
    .reduce((sum, f) => sum + f.amount, 0);

  const quickActions = [
    { icon: BookOpen, label: "Subjects", href: "/dashboard/subjects" },
    { icon: Calendar, label: "Timetable", href: "/dashboard/timetable" },
    { icon: BarChart3, label: "Attendance", href: "/dashboard/attendance" },
    { icon: TrendingUp, label: "Results", href: "/dashboard/results" },
    { icon: DollarSign, label: "Fees", href: "/dashboard/fees" },
    { icon: FileText, label: "Assignments", href: "/dashboard/assignments" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {studentData.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {studentData.program} • Year {studentData.year}, Semester {studentData.semester}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {attendancePercentage}%
            </div>
            <p
              className={`text-xs mt-2 ${
                attendancePercentage >= 85
                  ? "text-green-600"
                  : attendancePercentage >= 75
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {attendancePercentage >= 85
                ? "✓ Good"
                : attendancePercentage >= 75
                  ? "⚠ Fair"
                  : "⚠ At Risk"}
            </p>
          </CardContent>
        </Card>

        {/* SGPA Card – now uses mockExamResults */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current SGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentSGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Out of 10.0</p>
          </CardContent>
        </Card>

        {/* Pending Fees Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{pendingFees}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockFees.filter((f) => f.status === "Pending").length} item(s)
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Exams Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">A</div>
            <p className="text-xs text-muted-foreground mt-2">Best performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notices</CardTitle>
          <CardDescription>Latest announcements and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockNotices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
              >
                <Badge variant={notice.isUnread ? "default" : "outline"}>
                  {notice.priority}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {notice.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notice.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            asChild>
            <Link href="/dashboard/events">View All Notices</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-center">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}