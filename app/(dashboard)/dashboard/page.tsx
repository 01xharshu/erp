"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
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
  ArrowRight,
} from "lucide-react";
import { mockStudent, mockNotices } from "@/lib/mockData";
import { getStudentData, getAuthToken } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profRes, noteRes, attRes] = await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/notices", { headers }),
          fetch("/api/attendance", { headers })
        ]);
        
        const [profData, noteData, attData] = await Promise.all([
          profRes.json(),
          noteRes.json(),
          attRes.json()
        ]);

        if (profData.success) {
          const combined = { 
            ...profData.data,
            attendanceRate: attData.success ? attData.percentage : 85
          };
          setStudentData(combined);
        } else {
          setStudentData(getStudentData() || mockStudent);
        }
        
        if (noteData.success) setNotices(noteData.data);
        else setNotices(mockNotices);

      } catch (e) {
        setStudentData(getStudentData() || mockStudent);
        setNotices(mockNotices);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  if (isLoading || !studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const attendancePercentage = studentData.attendanceRate ?? studentData.attendancePercentage ?? 85;

  const currentSGPA = studentData.cgpa || 7.85;

  const pendingFees = studentData.pendingFees ?? 0;

  const isFaculty = studentData.role === "faculty";

  const studentQuickActions = [
    { icon: BookOpen, label: "Subjects", href: "/dashboard/subjects" },
    { icon: Calendar, label: "Timetable", href: "/dashboard/timetable" },
    { icon: BarChart3, label: "Attendance", href: "/dashboard/attendance" },
    { icon: TrendingUp, label: "Results", href: "/dashboard/results" },
    { icon: DollarSign, label: "Fees", href: "/dashboard/fees" },
    { icon: FileText, label: "Assignments", href: "/dashboard/assignments" },
  ];
  
  const facultyQuickActions = [
    { icon: BookOpen, label: "My Classes", href: "/dashboard/subjects" },
    { icon: Calendar, label: "Schedule", href: "/dashboard/timetable" },
    { icon: BarChart3, label: "Mark Attendance", href: "/dashboard/attendance" },
    { icon: TrendingUp, label: "Upload Results", href: "/dashboard/results" },
    { icon: FileText, label: "Create Assignments", href: "/dashboard/assignments" },
  ];

  const quickActions = isFaculty ? facultyQuickActions : studentQuickActions;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-8 md:p-12 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-none mb-4 hover:bg-white/30 backdrop-blur-md">
            {isFaculty ? "Faculty Portal" : "New Academic Term"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl max-w-2xl leading-[1.1]">
            Welcome back,<br />{studentData.firstName || studentData.name || "Student"}
          </h1>
          <p className="text-white/80 mt-6 text-sm md:text-lg font-medium">
            {isFaculty 
              ? `${studentData.department || "General"} Department • ${studentData.designation || "Faculty"}` 
              : `${studentData.program || "Student Program"} • Year ${studentData.year || 1} • Sem ${studentData.semester || 1}`}
          </p>
          <div className="flex gap-3 mt-8">
            <Button asChild className="rounded-full bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg">
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 backdrop-blur-md border border-white/20">
              <Link href="/dashboard/settings">Settings</Link>
            </Button>
          </div>
        </div>
        {/* Abstract shapes to match ref 1 feel */}
        <div className="absolute top-[-20%] right-[-10%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[10%] h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isFaculty ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Classes Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Next: Data Structures at 11:00 AM</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">42</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Require grading</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">85%</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Across all your subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">5</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">From students and admin</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {attendancePercentage}%
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className={`h-1.5 w-full rounded-full bg-secondary overflow-hidden`}>
                      <div 
                        className={`h-full rounded-full ${attendancePercentage >= 75 ? 'bg-primary' : 'bg-destructive'}`} 
                        style={{ width: `${attendancePercentage}%` }}
                      />
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current SGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{currentSGPA.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Out of 10.0 scale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fees Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">₹{pendingFees}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  Due for current term
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">A+</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Top 5% of Batch</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Notices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notices</CardTitle>
              <CardDescription>Latest announcements and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/events" className="text-primary gap-1">
                See All <ArrowRight className="h-4 w-4"/>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notices.length > 0 ? notices.slice(0, 3).map((notice) => (
              <div
                key={notice.noticeId}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className={cn(
                  "mt-1 h-2 w-2 rounded-full shrink-0",
                  notice.priority === "High" ? "bg-red-500" : notice.priority === "Medium" ? "bg-amber-500" : "bg-blue-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight">
                    {notice.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {notice.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-tighter">
                    {new Date(notice.createdAt).toLocaleDateString()} • {notice.priority} Priority
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center opacity-30 text-xs">No active notices found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="text-primary rounded-full">See All</Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center gap-3 transition-all active:scale-95"
              >
                <div className="flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-[28px] bg-card border border-border shadow-sm group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                  <Icon className="h-7 w-7 md:h-9 md:h-9 text-primary transition-transform group-hover:scale-110" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors">
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
