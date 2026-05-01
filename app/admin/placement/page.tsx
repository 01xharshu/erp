"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Users, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockPlacementData = [
  { id: "PLC-001", company: "TechNova Inc.", role: "Software Engineer", ctc: "12 LPA", studentsApplied: 45, status: "Ongoing", date: "May 20, 2026" },
  { id: "PLC-002", company: "Global Finance", role: "Data Analyst", ctc: "8 LPA", studentsApplied: 120, status: "Completed", date: "April 15, 2026" },
  { id: "PLC-003", company: "BuildCorp", role: "Civil Engineer", ctc: "6.5 LPA", studentsApplied: 30, status: "Upcoming", date: "June 10, 2026" },
];

export default function AdminPlacementPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Placement & Training</h1>
          <p className="text-muted-foreground">Manage campus recruitment drives and training sessions</p>
        </div>
        <Button className="gap-2"><Briefcase className="h-4 w-4" /> Schedule Drive</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Placed (2026 Batch)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">342</div>
            <p className="text-sm text-muted-foreground mt-1">78% of eligible students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">14</div>
            <p className="text-sm text-muted-foreground mt-1">Currently recruiting on campus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42 LPA</div>
            <p className="text-sm text-muted-foreground mt-1">Offered by TechGiant</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Drives</CardTitle>
          <CardDescription>Track upcoming and ongoing recruitment events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input placeholder="Search company or role..." className="max-w-md rounded-xl" />
          </div>
          
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Package (CTC)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPlacementData.map((drive) => (
                  <TableRow key={drive.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg"><Building2 className="h-4 w-4" /></div>
                        {drive.company}
                      </div>
                    </TableCell>
                    <TableCell>{drive.role}</TableCell>
                    <TableCell className="font-mono">{drive.ctc}</TableCell>
                    <TableCell>{drive.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{drive.studentsApplied}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {drive.status === "Completed" && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 border-0"><CheckCircle className="h-3 w-3" /> Completed</Badge>}
                      {drive.status === "Ongoing" && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1 border-0">Ongoing</Badge>}
                      {drive.status === "Upcoming" && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1"><Clock className="h-3 w-3" /> Upcoming</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
