import { cookies } from "next/headers";
import { decodeSessionToken } from "@/lib/session";
import { getDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
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
import Link from "next/link";
import { Notice, Timetable } from "@/lib/db-models";

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("erp_auth_token")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const session = decodeSessionToken(token);
  if (!session) {
    redirect("/login");
  }

  const db = await getDatabase();
  const isFaculty = session.role === "faculty";
  
  let studentData: any = { ...session };
  let notices: any[] = [];
  
  try {
    // Get notices
    notices = await db.collection<Notice>("notices")
      .find({ targetRole: { $in: ["all", session.role as "student" | "faculty"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    if (isFaculty) {
      const employeeId = session.employeeId;
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = days[new Date().getDay()];
      
      const timetables = await db.collection<Timetable>("timetables").find({
        "schedule.slots.facultyId": employeeId
      }).toArray();
      
      let classesTodayCount = 0;
      let nextClass = null;
      let earliestTimeStr = "23:59";
      
      timetables.forEach(tt => {
        const todaySchedule = tt.schedule.find(s => s.day === today);
        if (todaySchedule) {
          const mySlots = todaySchedule.slots.filter(s => s.facultyId === employeeId);
          classesTodayCount += mySlots.length;
          
          if (mySlots.length > 0) {
             const firstSlot = mySlots[0];
             if (firstSlot.time < earliestTimeStr || earliestTimeStr === "23:59") {
                 earliestTimeStr = firstSlot.time;
                 nextClass = `${firstSlot.subject} at ${firstSlot.time.split(" - ")[0]}`;
             }
          }
        }
      });

      const pendingAssignmentsCount = await db.collection("assignments").countDocuments({ status: "Active", facultyId: employeeId });

      studentData = {
        ...studentData,
        classesToday: classesTodayCount,
        nextClass: nextClass || "No more classes today",
        pendingAssignments: pendingAssignmentsCount,
        averageAttendance: "85%", // Placeholder
        unreadMessages: notices.length
      };
    } else {
      const enrollmentNo = session.enrollmentNo;
      
      const user = await db.collection("students").findOne({ enrollmentNo });
      
      const attendance = await db.collection("attendance").find({ enrollmentNo }).toArray();
      const present = attendance.filter(a => a.status === "P").length;
      const attRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 100;
      
      const pendingFees = user?.pendingFees ?? 0;
      const cgpa = user?.cgpa ?? 0;
      
      studentData = {
        ...studentData,
        ...user,
        attendancePercentage: attRate,
        cgpa: cgpa > 0 ? cgpa : 0.0,
        pendingFees,
        academicGrade: cgpa > 9 ? "A+" : cgpa > 8 ? "A" : cgpa > 7 ? "B" : "N/A"
      };
    }
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  return { studentData, notices, isFaculty };
}

export default async function DashboardPage() {
  const { studentData, notices, isFaculty } = await getDashboardData();

  const attendancePercentage = studentData.attendanceRate ?? studentData.attendancePercentage ?? 85;
  const currentSGPA = studentData.cgpa || 7.85;
  const pendingFees = studentData.pendingFees ?? 0;

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
                <div className="text-3xl font-bold text-primary">{studentData.classesToday ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Next: {studentData.nextClass ?? "None"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{studentData.pendingAssignments ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Require grading</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{studentData.averageAttendance ?? "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Across all your subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{studentData.unreadMessages ?? 0}</div>
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
                <div className="text-3xl font-bold text-primary">{studentData.academicGrade || "N/A"}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Current Status</p>
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
                key={notice._id?.toString() || notice.noticeId}
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
                  <Icon className="h-7 w-7 md:h-9 text-primary transition-transform group-hover:scale-110" />
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
