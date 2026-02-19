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

      {/* Subjects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSubjects.map((subject) => (
          <Card
            key={subject.id}
            className="
              hover:shadow-lg transition-all duration-200
              border border-border/40 hover:border-border/70
              bg-card/50 backdrop-blur-sm
              flex flex-col rounded-xl overflow-hidden
            "
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

                {/* Changed <a> → <Link> → now Link is used */}
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link href={subject.syllabusPDF} download>
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
                  <p className="font-medium">{subject.faculty}</p>
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
      <Card className="border border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle>Semester Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <p className="text-2xl font-bold mt-1">{mockSubjects.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold mt-1">
                {mockSubjects.reduce((sum, s) => sum + s.credits, 0)}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Core Subjects</p>
              <p className="text-2xl font-bold mt-1">
                {mockSubjects.filter((s) => s.type === "Core").length}
              </p>
            </div>
          </div>

          {/* Small table */}
          <div className="overflow-x-auto rounded-md border border-border/30 bg-background/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-right text-xs">Count</TableHead>
                  <TableHead className="text-right text-xs">Total Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["Core", "Elective", "Lab"].map((type) => {
                  const subjectsOfType = mockSubjects.filter((s) => s.type === type);
                  return (
                    <TableRow key={type} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-sm">{type}</TableCell>
                      <TableCell className="text-right text-sm">{subjectsOfType.length}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {subjectsOfType.reduce((sum, s) => sum + s.credits, 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}