"use client";

import { useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockAttendance, mockSubjects, calculateAttendancePercentage } from "@/lib/mockData";
import { CheckCircle, XCircle, Calendar, FileUp } from "lucide-react";
import { toast } from "sonner";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("December");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const attendancePercentage = calculateAttendancePercentage();

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
        return "bg-green-100 text-green-800";
      case "A":
        return "bg-red-100 text-red-800";
      case "L":
        return "bg-blue-100 text-blue-800";
      case "M":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Track your attendance and manage leave applications
          </p>
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
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
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
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
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
