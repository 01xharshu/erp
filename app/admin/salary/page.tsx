"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, CheckCircle, Clock } from "lucide-react";
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

const mockSalaryData = [
  { id: "FAC001", name: "Ananya Gupta", department: "Computer Science", role: "Professor", basic: 120000, status: "Paid", month: "May 2026" },
  { id: "FAC002", name: "Vikram Singh", department: "Mathematics", role: "Assistant Prof", basic: 90000, status: "Pending", month: "May 2026" },
  { id: "FAC003", name: "Priya Sharma", department: "Computer Science", role: "Associate Prof", basic: 105000, status: "Paid", month: "May 2026" },
];

export default function AdminSalaryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Faculty Salary</h1>
          <p className="text-muted-foreground">Manage and disburse monthly payroll</p>
        </div>
        <Button className="gap-2"><IndianRupee className="h-4 w-4" /> Process Payroll</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹15,40,000</div>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> +2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disbursed (May)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹8,50,000</div>
            <p className="text-sm text-muted-foreground mt-1">12/24 Faculty Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">₹6,90,000</div>
            <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Ledger</CardTitle>
          <CardDescription>Current month salary status for all faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input placeholder="Search faculty name or ID..." className="max-w-md rounded-xl" />
          </div>
          
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSalaryData.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <p className="font-medium">{salary.name}</p>
                      <p className="text-xs text-muted-foreground">{salary.id} • {salary.role}</p>
                    </TableCell>
                    <TableCell>{salary.department}</TableCell>
                    <TableCell className="font-mono">₹{salary.basic.toLocaleString()}</TableCell>
                    <TableCell>{salary.month}</TableCell>
                    <TableCell>
                      {salary.status === "Paid" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 border-0">
                          <CheckCircle className="h-3 w-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Payslip</Button>
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
