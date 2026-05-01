"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileUp,
  File,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { getStudentData } from "@/lib/auth";

export default function AssignmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Faculty specific states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const userData = getStudentData() as any;
  const isFaculty = userData?.role === "faculty";

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("erp_auth_token") || localStorage.getItem("authToken");
      const res = await fetch("/api/assignments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingAssignments = assignments.filter((a) => !a.status || a.status === "Pending" || a.status === "Active");
  const submittedAssignments = assignments.filter((a) =>
    ["Submitted", "Graded"].includes(a.status)
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Assignment submitted successfully!");
    setFile(null);
    setIsSubmitting(false);
    // In a real app, you would post the file and update the status in the DB
    fetchAssignments();
  };

  const handleCreateAssignment = async () => {
    if (!title || !subject || !dueDate) {
      toast.error("Please fill required fields (Title, Subject, Due Date)");
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem("erp_auth_token") || localStorage.getItem("authToken");
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, subject, dueDate, description })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Assignment created successfully!");
        setIsCreateOpen(false);
        setTitle("");
        setSubject("");
        setDueDate("");
        setDescription("");
        fetchAssignments();
      } else {
        toast.error(data.error || "Failed to create assignment");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  const isLate = (dDate: string) => {
    return new Date(dDate) < new Date();
  };

  const daysUntilDue = (dDate: string) => {
    const due = new Date(dDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isFaculty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-blue-400/10 p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Assignments Hub</h1>
              <p className="text-muted-foreground">Create, distribute and grade assignments</p>
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><PlusCircle className="h-4 w-4"/> Create Assignment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>Distribute a new assignment to your students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="e.g. Lab Report 1" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Code</label>
                    <Input placeholder="e.g. CS-101" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Instructions for the assignment..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
                </div>
                <Button onClick={handleCreateAssignment} disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : "Create & Distribute"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Needs Grading & Active</CardTitle>
            <CardDescription>Recent assignments you distributed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.length > 0 ? assignments.map((assignment, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 hover:border-primary/50 transition-colors bg-card/40">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-secondary/30 rounded-xl"><Users className="h-5 w-5 text-primary"/></div>
                   <div>
                     <h3 className="font-bold text-lg">{assignment.title}</h3>
                     <p className="text-sm text-muted-foreground">{assignment.subject} • Due {assignment.dueDate}</p>
                   </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">{assignment.submissions?.length || 0} Submitted</Badge>
                  <Button variant="outline">Review</Button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-40">
                <p>No active assignments. Create one to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          Submit assignments and view feedback from faculty
        </p>
      </div>

      {/* Assignment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {pendingAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">To be submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {submittedAssignments.filter((a) => a.status === "Submitted").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting grading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {submittedAssignments.filter((a) => a.status === "Graded").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pending Assignments</h2>
        {pendingAssignments.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {pendingAssignments.map((assignment, idx) => (
              <Card key={assignment._id || idx}>
                <AccordionItem value={assignment._id || `${idx}`}>
                  <AccordionTrigger
                    className="px-6 cursor-pointer"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <div className="flex items-start gap-3 text-left flex-1 mr-4">
                      <FileText className="h-5 w-5 mt-1 text-primary" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            isLate(assignment.dueDate)
                              ? "destructive"
                              : daysUntilDue(assignment.dueDate) <= 3
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {isLate(assignment.dueDate)
                            ? "Overdue"
                            : `${daysUntilDue(assignment.dueDate)}d left`}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Description</p>
                          <p className="font-medium">{assignment.description || "No description provided."}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">{assignment.dueDate}</p>
                        </div>
                      </div>

                      {isLate(assignment.dueDate) && (
                        <Alert className="border-destructive/50 bg-destructive/10">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <AlertDescription>
                            This assignment is overdue. Late submissions may attract
                            grade deduction.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2">
                            <FileUp className="h-4 w-4" />
                            Upload & Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Assignment</DialogTitle>
                            <DialogDescription>
                              {assignment.title} - {assignment.subject}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Upload File (PDF, Images, Docs)
                              </label>
                              <Input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                              {file && (
                                <p className="text-sm text-muted-foreground">
                                  Selected: {file.name}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={handleSubmitAssignment}
                              disabled={isSubmitting || !file}
                              className="w-full"
                            >
                              {isSubmitting
                                ? "Submitting..."
                                : "Submit Assignment"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-muted-foreground">
                All assignments are submitted!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submitted & Graded Assignments */}
      {submittedAssignments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Submitted & Graded</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {submittedAssignments.map((assignment, idx) => (
              <Card key={assignment._id || idx}>
                <AccordionItem value={assignment._id || `${idx}`}>
                  <AccordionTrigger
                    className="px-6 cursor-pointer"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <div className="flex items-start gap-3 text-left flex-1 mr-4">
                      {assignment.status === "Graded" ? (
                        <CheckCircle className="h-5 w-5 mt-1 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 mt-1 text-blue-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="secondary">{assignment.status}</Badge>
                        {assignment.marks && (
                          <p className="text-sm font-bold text-primary">
                            {assignment.marks}/100
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">{assignment.status}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Marks</p>
                          <p className="font-bold text-primary">
                            {assignment.marks || "—"}/100
                          </p>
                        </div>
                      </div>

                      {assignment.feedback && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Faculty Feedback</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {assignment.feedback}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {assignment.submittedFile && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <File className="h-4 w-4" />
                            Download Submission
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}