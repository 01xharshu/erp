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
      <Card className="bg-muted/50">
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