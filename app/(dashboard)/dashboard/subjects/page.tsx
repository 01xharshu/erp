"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSubjects } from "@/lib/mockData";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

export default function SubjectsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">
          Current semester subjects and course information
        </p>
      </div>

      <div className="grid gap-4">
        {mockSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {subject.name}
                    <Badge variant="outline">{subject.type}</Badge>
                  </CardTitle>
                  <CardDescription>Code: {subject.code}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild>
                  <a href={subject.syllabusPDF} download>
                    <Download className="h-4 w-4 mr-1" />
                    Syllabus
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Faculty</p>
                  <p className="font-medium">{subject.faculty}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Credits</p>
                  <p className="font-medium">{subject.credits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{subject.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Credits Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Semester Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <p className="text-2xl font-bold">{mockSubjects.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold">
                {mockSubjects.reduce((sum, s) => sum + s.credits, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Core Subjects</p>
              <p className="text-2xl font-bold">
                {mockSubjects.filter((s) => s.type === "Core").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
