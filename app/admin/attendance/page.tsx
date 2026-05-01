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
import { AlertTriangle, CheckCircle2, UserX, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

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
  status?: "Active" | "Debarred" | "Suspended";
}

interface FeeRecord {
  feeId: string;
  enrollmentNo: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: number;
}

interface AttendanceRecordAgg {
  enrollmentNo: string;
  totalClasses: number;
  presentClasses: number;
  percentage: number;
}

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecordAgg[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Thresholds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterReason, setFilterReason] = useState("all");
  const [showOnlyDebarred, setShowOnlyDebarred] = useState(false);
  
  const [thresholds, setThresholds] = useState({
    attendance: 75,
    cgpa: 5.0,
    fees: 10000
  });

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, feeRes, attRes] = await Promise.all([
          fetch("/api/admin/students", { headers: getAuthHeaders() }),
          fetch("/api/admin/fees", { headers: getAuthHeaders() }),
          fetch("/api/admin/attendance", { headers: getAuthHeaders() })
        ]);
        const [studData, feeData, attData] = await Promise.all([studRes.json(), feeRes.json(), attRes.json()]);
        if (studData.success) setStudents(studData.data || []);
        if (feeData.success) setFees(feeData.data || []);
        if (attData.success) setAttendance(attData.data || []);
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

    const attByStudent: Record<string, number> = {};
    attendance.forEach(a => {
      attByStudent[a.enrollmentNo] = a.percentage;
    });

    return students.map(s => {
      const feeInfo = feesByStudent[s.enrollmentNo] || { overdue: 0, pending: 0, totalDue: 0 };
      const attPercentage = attByStudent[s.enrollmentNo] ?? 100;
      const reasons: string[] = [];
      
      if (attPercentage < thresholds.attendance) reasons.push(`Low Attendance (${attPercentage}%)`);
      if (s.cgpa < thresholds.cgpa) reasons.push(`Low CGPA (${s.cgpa})`);
      if (feeInfo.overdue > 0 || feeInfo.totalDue > thresholds.fees) reasons.push(`Fee Overdue/High Dues (₹${feeInfo.totalDue})`);
      
      const isCritical = reasons.length > 0;
      return { ...s, feeInfo, attPercentage, reasons, isAtRisk: isCritical };
    }).filter(s => {
        if (showOnlyDebarred) return s.status === "Debarred";
        return s.isAtRisk || s.status === "Debarred";
    });
  }, [students, fees, attendance, thresholds, showOnlyDebarred]);

  const filteredDebarred = useMemo(() => {
    return debarredList.filter(s => {
      const q = searchQuery.toLowerCase();
      if (q && !s.firstName.toLowerCase().includes(q) && !s.lastName.toLowerCase().includes(q) && !s.enrollmentNo.toLowerCase().includes(q)) return false;
      if (filterDept !== "all" && s.department !== filterDept) return false;
      if (filterReason !== "all") {
        if (filterReason === "fee" && !s.reasons.some(r => r.includes("Fee"))) return false;
        if (filterReason === "cgpa" && !s.reasons.some(r => r.includes("CGPA"))) return false;
        if (filterReason === "attendance" && !s.reasons.some(r => r.includes("Attendance"))) return false;
      }
      return true;
    });
  }, [debarredList, searchQuery, filterDept, filterReason]);

  const toggleDebarStatus = async (student: any) => {
    const newStatus = student.status === "Debarred" ? "Active" : "Debarred";
    try {
        const res = await fetch("/api/admin/students", {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ enrollmentNo: student.enrollmentNo, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            toast.success(`Student ${student.enrollmentNo} marked as ${newStatus}`);
            setStudents(prev => prev.map(s => s.enrollmentNo === student.enrollmentNo ? { ...s, status: newStatus } : s));
        } else {
            toast.error(data.message);
        }
    } catch (e) {
        toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    const csvContent = "Enrollment No,Name,Department,Attendance,CGPA,Status,Reasons\n" + 
      filteredDebarred.map(s => `"${s.enrollmentNo}","${s.firstName} ${s.lastName}","${s.department}","${s.attPercentage}%","${s.cgpa}","${s.status || 'Active'}","${s.reasons.join('; ')}"`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `debarment_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDebarred.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDebarred.slice(start, start + itemsPerPage);
  }, [filteredDebarred, currentPage]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, filterReason]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance & Debarment</h1>
          <p className="mt-2 text-muted-foreground">Monitor attendance issues, fee defaults, and manage student eligibility</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleExport}><ClipboardList className="w-4 h-4 mr-2" /> Export CSV</Button>
            <Button variant={showOnlyDebarred ? "default" : "outline"} className="rounded-xl" onClick={() => setShowOnlyDebarred(!showOnlyDebarred)}>
                {showOnlyDebarred ? "Show All At-Risk" : "Show Debarred Only"}
            </Button>
        </div>
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
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Debarred Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => s.status === "Debarred").length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Currently restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Config */}
      <Card className="bg-secondary/10 border-dashed">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Threshold Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                        <label>Attendance Lower Limit</label>
                        <span className="text-primary">{thresholds.attendance}%</span>
                    </div>
                    <input 
                        type="range" min="50" max="90" step="5" 
                        value={thresholds.attendance} 
                        onChange={e => setThresholds({...thresholds, attendance: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                        <label>CGPA Warning Threshold</label>
                        <span className="text-primary">{thresholds.cgpa}</span>
                    </div>
                    <input 
                        type="range" min="3" max="7" step="0.5" 
                        value={thresholds.cgpa} 
                        onChange={e => setThresholds({...thresholds, cgpa: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                        <label>Fee Due Threshold</label>
                        <span className="text-primary">₹{thresholds.fees}</span>
                    </div>
                    <input 
                        type="range" min="0" max="50000" step="5000" 
                        value={thresholds.fees} 
                        onChange={e => setThresholds({...thresholds, fees: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                </div>
            </div>
        </CardContent>
      </Card>

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
                <SelectItem value="attendance">Low Attendance</SelectItem>
                <SelectItem value="fee">Fee Overdue</SelectItem>
                <SelectItem value="cgpa">Low CGPA</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || filterDept !== "all" || filterReason !== "all") && (
              <Button variant="outline" size="sm" className="rounded-xl h-10" onClick={() => { setSearchQuery(""); setFilterDept("all"); setFilterReason("all"); }}>Clear</Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Risk Flags</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((s) => (
                <TableRow key={s.enrollmentNo} className={s.status === "Debarred" ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                  <TableCell className="font-medium">
                      {s.enrollmentNo}
                      {s.status === "Debarred" && <Badge variant="destructive" className="ml-2 scale-75">DEBARRED</Badge>}
                  </TableCell>
                  <TableCell>{s.firstName} {s.lastName}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>
                    <span className={s.attPercentage < thresholds.attendance ? "text-red-500 font-bold" : ""}>{s.attPercentage}%</span>
                  </TableCell>
                  <TableCell>
                    <span className={s.cgpa < thresholds.cgpa ? "text-amber-500 font-bold" : ""}>{s.cgpa.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.reasons.map((r, i) => (
                        <Badge key={i} variant={r.includes("Fee") ? "destructive" : r.includes("Attendance") ? "secondary" : "outline"} className="text-[10px]">
                          {r}
                        </Badge>
                      ))}
                      {s.reasons.length === 0 && s.status === "Debarred" && <span className="text-[10px] text-muted-foreground italic">Manual Restriction</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        variant={s.status === "Debarred" ? "outline" : "destructive"} 
                        size="sm" 
                        className="h-8 rounded-lg text-xs"
                        onClick={() => toggleDebarStatus(s)}
                    >
                        {s.status === "Debarred" ? "Revoke" : "Debar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDebarred.length > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDebarred.length)} of {filteredDebarred.length} entries
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {filteredDebarred.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
              {debarredList.length === 0 ? "No students are currently at risk. 🎉" : "No students match the current filters."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
