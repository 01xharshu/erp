"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockAttendance, mockSubjects } from "@/lib/mockData";
import { CheckCircle, XCircle, Calendar, FileUp, Users } from "lucide-react";
import { toast } from "sonner";
import { getStudentData, getAuthToken } from "@/lib/auth";

export default function AttendancePage() {
  const [_attendanceData, setAttendanceData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [markedAttendance, setMarkedAttendance] = useState<Record<string, "P" | "A">>({});
  const [isLoading, setIsLoading] = useState(true);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("January");

  // Marking Pagination
  const [markingPage, setMarkingPage] = useState(1);
  const studentsPerPage = 20;

  const userData = getStudentData() as any;
  const isFaculty = userData?.role === "faculty";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch personal stats/attendance
        const profRes = await fetch("/api/profile", { headers });
        const profData = await profRes.json();
        
        if (isFaculty) {
          // Fetch faculty schedule to see today's classes
          const timeRes = await fetch("/api/timetable", { headers });
          const timeData = await timeRes.json();
          if (timeData.success && timeData.data.length > 0) {
            const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
            const todaySchedule = timeData.data[0].schedule.find((d: any) => d.day === today);
            setClasses(todaySchedule?.slots || []);
          }
        } else {
          // Fetch student attendance records
          setAttendanceData(profData.data?.attendanceRecords || []);
        }
      } catch (e) {
        console.error("Failed to fetch attendance data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isFaculty]);

  const loadStudentsForClass = async (cls: any) => {
    setSelectedClass(cls);
    setIsLoading(true);
    try {
      const token = getAuthToken();
      // Use existing students list API but filter by program/sem/sec
      // Assuming cls.classContext looks like "Program Sem X Sec Y"
      const match = cls.classContext.match(/(.+) Sem (\d+) Sec (.+)/);
      if (match) {
        const [_, program, semester, section] = match;
        const res = await fetch(`/api/admin/students?program=${encodeURIComponent(program)}&semester=${semester}&section=${section}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStudentsInClass(data.data);
          // Initialize attendance as all Present
          const initial: any = {};
          data.data.forEach((s: any) => initial[s.enrollmentNo] = "P");
          setMarkedAttendance(initial);
        }
      }
    } catch (err) {
      toast.error("Failed to load student list");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAttendance = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const records = Object.entries(markedAttendance).map(([enrollmentNo, status]) => ({
        enrollmentNo,
        status,
        date: new Date().toISOString().split('T')[0],
        period: selectedClass.time,
        subject: selectedClass.subject,
        facultyId: userData.uniqueId
      }));

      // In real scenario, we'd have a bulk upload API. 
      // For now, we'll hit markAttendance for each (or create a bulk route)
      // Let's assume we have a bulk route /api/admin/attendance
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Attendance marked successfully!");
        setSelectedClass(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error saving attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const attendancePercentage = userData?.attendanceRate ?? 85;

  // Per-subject attendance
  const getSubjectAttendance = (subjectName: string) => {
    const subjectRecords = mockAttendance.filter(
      (a) => a.subject === subjectName
    );
    const presentCount = subjectRecords.filter(
      (a) => a.status === "P"
    ).length;
    return Math.round((presentCount / subjectRecords.length) * 100) || 0;
  };

  const handleSubmitLeave = async () => {
    if (!leaveDate || !leaveReason) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingLeave(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.success("Leave application submitted successfully!");
    setLeaveDate("");
    setLeaveReason("");
    setIsSubmittingLeave(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "border border-emerald-500/25 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
      case "A":
        return "border border-rose-500/25 bg-rose-500/15 text-rose-700 dark:text-rose-300";
      case "L":
        return "border border-sky-500/25 bg-sky-500/15 text-sky-700 dark:text-sky-300";
      case "M":
        return "border border-violet-500/25 bg-violet-500/15 text-violet-700 dark:text-violet-300";
      default:
        return "border border-border/70 bg-muted/70 text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "P":
        return "Present";
      case "A":
        return "Absent";
      case "L":
        return "Leave";
      case "M":
        return "Medical";
      default:
        return "Other";
    }
  };

  if (isFaculty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-amber-400/10 p-5">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Class Attendance</h1>
              <p className="text-muted-foreground">Manage and record attendance for your assigned classes</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Select a class to mark attendance for today ({new Date().toDateString()})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {classes.length > 0 ? classes.map((cls, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 hover:border-primary/50 transition-colors bg-card/40">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
                    {cls.time.split(' - ')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{cls.subject}</h3>
                    <p className="text-sm text-muted-foreground">{cls.classContext} • Room {cls.room}</p>
                  </div>
                </div>
                
                <Dialog open={selectedClass === cls && !!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => loadStudentsForClass(cls)}>Mark Attendance</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mark Attendance: {cls.subject}</DialogTitle>
                      <DialogDescription>{cls.classContext} • {cls.time}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="text-sm font-medium">Total Students: {studentsInClass.length}</p>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={markingPage === 1} 
                                onClick={() => setMarkingPage(p => p - 1)}
                            >Previous</Button>
                            <span className="text-xs">Page {markingPage} of {Math.ceil(studentsInClass.length / studentsPerPage)}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={markingPage >= Math.ceil(studentsInClass.length / studentsPerPage)} 
                                onClick={() => setMarkingPage(p => p + 1)}
                            >Next</Button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-3 text-left">Enrollment</th>
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsInClass.slice((markingPage - 1) * studentsPerPage, markingPage * studentsPerPage).map((student) => (
                              <tr key={student.enrollmentNo} className="border-t border-border hover:bg-muted/30">
                                <td className="p-3 font-mono text-xs">{student.enrollmentNo}</td>
                                <td className="p-3 font-medium">{student.firstName} {student.lastName}</td>
                                <td className="p-3">
                                  <div className="flex justify-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant={markedAttendance[student.enrollmentNo] === "P" ? "default" : "outline"}
                                      className="h-8 w-10 px-0"
                                      onClick={() => setMarkedAttendance(prev => ({ ...prev, [student.enrollmentNo]: "P" }))}
                                    >P</Button>
                                    <Button 
                                      size="sm" 
                                      variant={markedAttendance[student.enrollmentNo] === "A" ? "destructive" : "outline"}
                                      className="h-8 w-10 px-0"
                                      onClick={() => setMarkedAttendance(prev => ({ ...prev, [student.enrollmentNo]: "A" }))}
                                    >A</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setSelectedClass(null)}>Cancel</Button>
                        <Button onClick={submitAttendance} disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Attendance"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )) : (
              <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-40">
                <p>No classes scheduled for you today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Calendar icon added */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-amber-400/10 p-5">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-muted-foreground" /> {/* ← Calendar is now used */}
          <div>
            <h1 className="text-3xl font-bold">Attendance</h1>
            <p className="text-muted-foreground">
              Track your attendance and manage leave applications
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FileUp className="h-4 w-4" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>
                Submit a leave application for your absence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Date</label>
                <Input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  placeholder="Describe the reason for your leave..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmitLeave}
                disabled={isSubmittingLeave}
                className="w-full"
              >
                {isSubmittingLeave ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Attendance Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Overall Attendance</CardTitle>
          <CardDescription>Current semester attendance percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">
                {attendancePercentage}%
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {attendancePercentage >= 85
                    ? "✓ Excellent attendance"
                    : attendancePercentage >= 75
                      ? "⚠ Fair attendance"
                      : "⚠ Low attendance"}
                </p>
                <p>Maintain 75% for eligibility</p>
              </div>
            </div>
            <Progress value={attendancePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Per Subject</TabsTrigger>
          <TabsTrigger value="details">Attendance Details</TabsTrigger>
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
        </TabsList>

        {/* Per Subject Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSubjects.map((subject) => {
              const subjectAttendance = getSubjectAttendance(subject.name);
              return (
                <Card key={subject.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{subject.name}</CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {subjectAttendance}%
                      </span>
                      <Badge
                        variant={
                          subjectAttendance >= 85
                            ? "default"
                            : subjectAttendance >= 75
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {subjectAttendance >= 85
                          ? "Good"
                          : subjectAttendance >= 75
                            ? "Fair"
                            : "Low"}
                      </Badge>
                    </div>
                    <Progress value={subjectAttendance} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Attendance Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Attendance Records</CardTitle>
                  <CardDescription>Date-wise attendance status</CardDescription>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="December">December</SelectItem>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="February">February</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttendance.slice(0, 20).map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium">
                          {record.date}
                        </TableCell>
                        <TableCell className="text-sm">{record.period}</TableCell>
                        <TableCell className="text-sm">{record.subject}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {record.remarks || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Present", "Absent", "Leave", "Medical"].map((type, idx) => {
                  const count = mockAttendance.filter(
                    (a) => getStatusLabel(a.status) === type
                  ).length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        )}
                        <span className="font-medium text-sm">{type}</span>
                      </div>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
