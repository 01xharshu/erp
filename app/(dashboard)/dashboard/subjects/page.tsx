"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSubjects } from "@/lib/mockData";
import { getAuthToken } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch("/api/timetable", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          // Extract unique subjects from the timetable schedule
          const timetable = data.data[0];
          const subjectMap = new Map();
          
          timetable.schedule.forEach((day: any) => {
            day.slots.forEach((slot: any) => {
              if (slot.subject && !subjectMap.has(slot.subject)) {
                subjectMap.set(slot.subject, {
                  id: slot.id || Math.random().toString(),
                  name: slot.subject,
                  code: (slot.subject.substring(0, 3) + "-301").toUpperCase(),
                  faculty: slot.facultyName || "Global Faculty",
                  credits: 4,
                  type: "Core",
                  syllabusPDF: "#"
                });
              }
            });
          });
          
          setSubjects(Array.from(subjectMap.values()));
        } else {
          setSubjects(mockSubjects);
        }
      } catch (err) {
        setSubjects(mockSubjects);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground animate-pulse">Analyzing your curriculum...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">
          Current semester subjects and course information
        </p>
      </div>

      {/* Subjects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
          >
            <CardHeader className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2.5 flex-wrap text-lg">
                    <FileText className="h-5 w-5 text-muted-foreground/80" />
                    {subject.name}
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {subject.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Code: {subject.code}
                  </CardDescription>
                </div>

                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link href={subject.syllabusPDF}>
                    <Download className="h-4 w-4 mr-1.5" />
                    Syllabus
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="mt-auto pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Faculty</p>
                  <p className="font-medium truncate">{subject.faculty}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Credits</p>
                  <p className="font-medium">{subject.credits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium">{subject.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant="secondary" className="mt-1">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Semester Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Semester Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <p className="text-2xl font-bold mt-1">{subjects.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold mt-1">
                {subjects.reduce((sum, s) => sum + s.credits, 0)}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Core Subjects</p>
              <p className="text-2xl font-bold mt-1">
                {subjects.filter((s) => s.type === "Core").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}