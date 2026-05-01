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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockExamResults } from "@/lib/mockData";
import { getStudentData } from "@/lib/auth";
import { Upload, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("semester");

  // Calculate GPA
  const calculateGPA = () => {
    const totalCredits = mockExamResults.reduce((sum, r) => sum + r.credits, 0);
    const totalGradePoints = mockExamResults.reduce(
      (sum, r) => sum + r.percentage * (r.credits / 10),
      0
    );
    return (totalGradePoints / totalCredits).toFixed(2);
  };

  const gpa = calculateGPA(); // ← kept as-is

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const userData = getStudentData() as any;
  const isFaculty = userData?.role === "faculty";

  if (isFaculty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/12 via-ring/10 to-blue-400/10 p-5">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Grade Book</h1>
              <p className="text-muted-foreground">Upload and manage exam results for your classes</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Needs Grading</CardTitle>
            <CardDescription>Recent exams and continuous assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Mid-term Exam - CS101", "Lab Final - CS201", "Assignment 3 - CS301"].map((exam, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 hover:border-primary/50 transition-colors">
                <div>
                  <h3 className="font-bold text-lg">{exam}</h3>
                  <p className="text-sm text-muted-foreground">Pending 42/45 submissions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline"><FileDown className="h-4 w-4 mr-2"/> Template</Button>
                  <Button><Upload className="h-4 w-4 mr-2"/> Upload Marks</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-3 p-4 border border-green-500/20 bg-green-500/5 rounded-xl text-green-700 dark:text-green-400">
               <CheckCircle2 className="h-5 w-5" />
               <div className="flex-1">
                 <p className="font-bold">Quiz 1 - Data Structures</p>
                 <p className="text-xs">Uploaded on Dec 10, 2024</p>
               </div>
               <Badge className="bg-green-500/20 text-green-700 border-none hover:bg-green-500/30">Published</Badge>
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Results & Academic Performance</h1>
        <p className="text-muted-foreground">
          View your exam results, grades, and academic performance
        </p>
      </div>

      {/* Overall Performance Card – now uses computed gpa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current SGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">7.85</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 10.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{gpa}</div> {/* ← gpa is now used here */}
            <p className="text-xs text-muted-foreground mt-1">Cumulative GPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Academic Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-base">Good Standing</Badge>
            <p className="text-xs text-muted-foreground mt-2">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="semester">Semester Results</TabsTrigger>
          <TabsTrigger value="internal">Internal Assessments</TabsTrigger>
          <TabsTrigger value="performance">Performance Trend</TabsTrigger>
        </TabsList>

        {/* Semester Results Tab */}
        <TabsContent value="semester" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockExamResults.map((result) => (
                  <div key={result.subject} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{result.subject}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Internal: {result.internal}/{result.internal + 30}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            External: {result.external}/70
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getGradeColor(
                            result.percentage
                          )}`}
                        >
                          {result.grade}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.percentage}%
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={result.percentage}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Assessments Tab */}
        <TabsContent value="internal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Class Tests & Assignments</CardTitle>
              <CardDescription>Internal assessment scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assignment 1</TableHead>
                      <TableHead>Assignment 2</TableHead>
                      <TableHead>Class Test</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExamResults.map((result) => (
                      <TableRow key={result.subject}>
                        <TableCell className="font-medium text-sm">
                          {result.subject}
                        </TableCell>
                        <TableCell className="text-sm">15/20</TableCell>
                        <TableCell className="text-sm">16/20</TableCell>
                        <TableCell className="text-sm">7/10</TableCell>
                        <TableCell className="text-sm font-medium">
                          {result.internal}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trend Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance History</CardTitle>
              <CardDescription>
                Your academic performance across semesters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { semester: "Semester 1", cgpa: 7.85, trend: "↑" },
                  { semester: "Semester 2", cgpa: 7.88, trend: "↑" },
                  { semester: "Semester 3", cgpa: 7.92, trend: "↑" },
                ].map((item) => (
                  <div key={item.semester} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.semester}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">
                        {item.cgpa}
                      </span>
                      <span className="text-lg text-green-600">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grade Scale Reference */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Grade Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            {[
              { grade: "A+", range: "90-100" },
              { grade: "A", range: "85-89" },
              { grade: "B+", range: "80-84" },
              { grade: "B", range: "70-79" },
              { grade: "C", range: "<70" },
            ].map((item) => (
              <div key={item.grade}>
                <p className="font-medium">{item.grade}</p>
                <p className="text-muted-foreground">{item.range}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}