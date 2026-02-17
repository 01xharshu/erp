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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockAssignments } from "@/lib/mockData";
import {
  FileUp,
  File,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const pendingAssignments = mockAssignments.filter((a) => a.status === "Pending");
  const submittedAssignments = mockAssignments.filter((a) =>
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
  };

  const isLate = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const daysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

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
              {mockAssignments.filter((a) => a.status === "Submitted").length}
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
              {mockAssignments.filter((a) => a.status === "Graded").length}
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
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <AccordionItem value={assignment.id}>
                  <AccordionTrigger className="px-6">
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
                          <p className="text-muted-foreground">Issued Date</p>
                          <p className="font-medium">{assignment.issueDate}</p>
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
      <div>
        <h2 className="text-lg font-semibold mb-4">Submitted & Graded</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {submittedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <AccordionItem value={assignment.id}>
                <AccordionTrigger className="px-6">
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
                          {assignment.marks}/20
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
                          {assignment.marks || "—"}/20
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
    </div>
  );
}
