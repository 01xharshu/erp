"use client";

import { useMode, useModeVisibility } from "@/lib/mode-context";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="p-6 border-border/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </div>
        <div className="text-primary/40">{Icon}</div>
      </div>
    </Card>
  );
}

function FeatureSection({
  title,
  items,
  visibleFor,
}: {
  title: string;
  items: { label: string; description: string; icon: React.ReactNode }[];
  visibleFor: ("student" | "admin" | "faculty")[];
}) {
  const isVisible = useModeVisibility(visibleFor);
  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <Card key={idx} className="p-4 border-border/40">
            <div className="flex gap-3">
              <div className="text-primary/60 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ModeAwareContent() {
  const { mode } = useMode();

  const studentStats = [
    { title: "GPA", value: "3.82", icon: <Award className="w-6 h-6" />, description: "Current semester GPA" },
    { title: "Attendance", value: "94%", icon: <Clock className="w-6 h-6" />, description: "Average attendance" },
    { title: "Courses", value: "6", icon: <BookOpen className="w-6 h-6" />, description: "Active courses" },
  ];

  const facultyStats = [
    { title: "Students", value: "156", icon: <Users className="w-6 h-6" />, description: "Total students taught" },
    { title: "Courses", value: "4", icon: <BookOpen className="w-6 h-6" />, description: "Active courses" },
    { title: "Submissions", value: "89", icon: <TrendingUp className="w-6 h-6" />, description: "Pending submissions" },
  ];

  const adminStats = [
    { title: "Total Users", value: "2,345", icon: <Users className="w-6 h-6" />, description: "Active users" },
    { title: "Courses", value: "42", icon: <BookOpen className="w-6 h-6" />, description: "Total courses" },
    { title: "Events", value: "12", icon: <Calendar className="w-6 h-6" />, description: "Upcoming events" },
  ];

  const stats = mode === "student" ? studentStats : mode === "faculty" ? facultyStats : adminStats;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Demo Mode</h1>
        <p className="text-muted-foreground">
          Viewing as: <span className="font-semibold text-foreground capitalize">{mode}</span>
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Student Features */}
      <FeatureSection
        title="Student Dashboard Features"
        visibleFor={["student"]}
        items={[
          {
            label: "Academic Progress",
            description: "Track your grades and GPA across all courses",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            label: "Attendance Tracking",
            description: "Monitor your attendance percentage by subject",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            label: "Course Materials",
            description: "Access lecture notes, assignments, and resources",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Schedule",
            description: "View your class timetable and exam dates",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: "Results",
            description: "Check semester and internal exam results",
            icon: <Award className="w-4 h-4" />,
          },
          {
            label: "Fee Management",
            description: "View and pay your semester fees online",
            icon: <TrendingUp className="w-4 h-4" />,
          },
        ]}
      />

      {/* Faculty Features */}
      <FeatureSection
        title="Faculty Dashboard Features"
        visibleFor={["faculty"]}
        items={[
          {
            label: "Grade Management",
            description: "Upload and manage student grades and assessments",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            label: "Attendance Management",
            description: "Mark and track student attendance in real-time",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            label: "Assignment Distribution",
            description: "Create and distribute assignments to students",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Class Schedule",
            description: "Manage your teaching schedule and office hours",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: "Performance Analytics",
            description: "Analyze student performance and engagement metrics",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            label: "Student Feedback",
            description: "Receive and respond to student feedback and queries",
            icon: <Users className="w-4 h-4" />,
          },
        ]}
      />

      {/* Admin Features */}
      <FeatureSection
        title="Admin Dashboard Features"
        visibleFor={["admin"]}
        items={[
          {
            label: "User Management",
            description: "Manage all users, roles, and permissions",
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: "Course Management",
            description: "Create, edit, and manage all courses and curricula",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Analytics & Reports",
            description: "Access comprehensive institutional analytics",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            label: "Academic Calendar",
            description: "Configure academic calendar and event schedules",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: "Fee Configuration",
            description: "Set up and manage fee structures and payments",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            label: "System Settings",
            description: "Configure system-wide settings and preferences",
            icon: <AlertCircle className="w-4 h-4" />,
          },
        ]}
      />

      {/* Role Information */}
      <Alert className="border-primary/50 bg-primary/5">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Switch roles using the mode selector to see different features. Each role has access to specific functionality tailored to their needs.
        </AlertDescription>
      </Alert>
    </div>
  );
}
