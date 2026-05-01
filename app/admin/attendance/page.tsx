"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ClipboardList, UserX } from "lucide-react";

interface StudentRecord {
  _id: string;
  enrollmentNo: string;
  firstName: string;
  lastName: string;
  department: string;
  semester: number;
  section?: string;
  cgpa: number;
  program?: string;
}

interface FeeRecord {
  feeId: string;
  enrollmentNo: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: number;
}

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterReason, setFilterReason] = useState("all");

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, feeRes] = await Promise.all([
          fetch("/api/admin/students", { headers: getAuthHeaders() }),
          fetch("/api/admin/fees", { headers: getAuthHeaders() }),
        ]);
        const [studData, feeData] = await Promise.all([studRes.json(), feeRes.json()]);
        if (studData.success) setStudents(studData.data || []);
        if (feeData.success) setFees(feeData.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getAuthHeaders]);

  // Build debarred list
  const debarredList = useMemo(() => {
    const feesByStudent: Record<string, { overdue: number; pending: number; totalDue: number }> = {};
    fees.forEach(f => {
      if (!feesByStudent[f.enrollmentNo]) feesByStudent[f.enrollmentNo] = { overdue: 0, pending: 0, totalDue: 0 };
      if (f.status === "Overdue") { feesByStudent[f.enrollmentNo].overdue++; feesByStudent[f.enrollmentNo].totalDue += f.amount; }
      if (f.status === "Pending") { feesByStudent[f.enrollmentNo].pending++; feesByStudent[f.enrollmentNo].totalDue += f.amount; }
    });

    return students.map(s => {
      const feeInfo = feesByStudent[s.enrollmentNo] || { overdue: 0, pending: 0, totalDue: 0 };
      const reasons: string[] = [];
      // Low CGPA flagging
      if (s.cgpa < 5.0) reasons.push("Low CGPA (< 5.0)");
      // Fee issues
      if (feeInfo.overdue > 0) reasons.push(`Fee Overdue (${feeInfo.overdue} items, ₹${feeInfo.totalDue})`);
      else if (feeInfo.totalDue > 10000) reasons.push(`High Pending Dues (₹${feeInfo.totalDue})`);
      // Likely to debar
      if (s.cgpa < 6.0 && s.cgpa >= 5.0 && feeInfo.pending > 2) reasons.push("Likely to be Debarred");

      return { ...s, feeInfo, reasons, isAtRisk: reasons.length > 0 };
    }).filter(s => s.isAtRisk);
  }, [students, fees]);

  const filteredDebarred = useMemo(() => {
    return debarredList.filter(s => {
      const q = searchQuery.toLowerCase();
      if (q && !s.firstName.toLowerCase().includes(q) && !s.lastName.toLowerCase().includes(q) && !s.enrollmentNo.toLowerCase().includes(q)) return false;
      if (filterDept !== "all" && s.department !== filterDept) return false;
      if (filterReason !== "all") {
        if (filterReason === "fee" && !s.reasons.some(r => r.includes("Fee") || r.includes("Dues"))) return false;
        if (filterReason === "cgpa" && !s.reasons.some(r => r.includes("CGPA"))) return false;
        if (filterReason === "likely" && !s.reasons.some(r => r.includes("Likely"))) return false;
      }
      return true;
    });
  }, [debarredList, searchQuery, filterDept, filterReason]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance & Debarment</h1>
        <p className="mt-2 text-muted-foreground">Monitor attendance issues, fee defaults, and debarment risk</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Students <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Active enrollments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              At Risk <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{debarredList.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Students with issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Fee Defaults <UserX className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {debarredList.filter(s => s.reasons.some(r => r.includes("Fee") || r.includes("Dues"))).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overdue fee cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Low CGPA <ClipboardList className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {debarredList.filter(s => s.reasons.some(r => r.includes("CGPA"))).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Academic risk</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debarred & At-Risk Students</CardTitle>
          <CardDescription>Students flagged for attendance issues, fee defaults, or academic underperformance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Search name or enrollment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl"
            />
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {[...new Set(students.map(s => s.department))].sort().map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterReason} onValueChange={setFilterReason}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Risk Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Types</SelectItem>
                <SelectItem value="fee">Fee Issues</SelectItem>
                <SelectItem value="cgpa">Low CGPA</SelectItem>
                <SelectItem value="likely">Likely to Debar</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || filterDept !== "all" || filterReason !== "all") && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setSearchQuery(""); setFilterDept("all"); setFilterReason("all"); }}>Clear</Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Risk Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebarred.map((s) => (
                <TableRow key={s.enrollmentNo}>
                  <TableCell className="font-medium">{s.enrollmentNo}</TableCell>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>
                    <span className={s.cgpa < 6 ? "text-red-500 font-bold" : ""}>{s.cgpa.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.reasons.map((r, i) => (
                        <Badge key={i} variant={r.includes("Overdue") ? "destructive" : r.includes("Likely") ? "outline" : "secondary"} className="text-[10px]">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDebarred.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {debarredList.length === 0 ? "No students are currently at risk. 🎉" : "No students match the current filters."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
