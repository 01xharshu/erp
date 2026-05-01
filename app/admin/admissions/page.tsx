"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { UserPlus, CheckCircle2, XCircle } from "lucide-react";

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
  admissionDate?: string;
  email: string;
}

interface FeeRecord {
  feeId: string;
  enrollmentNo: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: number;
}

export default function AdminAdmissionsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSemType, setFilterSemType] = useState("all");

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
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getAuthHeaders]);

  // Build student fee status map
  const studentFeeStatus = useMemo(() => {
    const map: Record<string, { hasDues: boolean; totalDue: number; overdueCount: number }> = {};
    fees.forEach(f => {
      if (!map[f.enrollmentNo]) map[f.enrollmentNo] = { hasDues: false, totalDue: 0, overdueCount: 0 };
      if (f.status !== "Paid") {
        map[f.enrollmentNo].hasDues = true;
        map[f.enrollmentNo].totalDue += f.amount;
        if (f.status === "Overdue") map[f.enrollmentNo].overdueCount++;
      }
    });
    return map;
  }, [fees]);

  // New registrations (semester 1-2, recent admission)
  const newAdmissions = useMemo(() => {
    return students.filter(s => s.semester <= 2);
  }, [students]);

  // Semester registration (all students categorized by odd/even)
  const oddSemStudents = useMemo(() => students.filter(s => s.semester % 2 !== 0), [students]);
  const evenSemStudents = useMemo(() => students.filter(s => s.semester % 2 === 0), [students]);

  // Blocked students
  const blockedStudents = useMemo(() => {
    return students.filter(s => {
      const feeStatus = studentFeeStatus[s.enrollmentNo];
      return feeStatus && (feeStatus.overdueCount > 0 || feeStatus.totalDue > 10000);
    });
  }, [students, studentFeeStatus]);

  const getFilteredList = (list: StudentRecord[]) => {
    return list.filter(s => {
      const q = searchQuery.toLowerCase();
      if (q && !s.firstName.toLowerCase().includes(q) && !s.lastName.toLowerCase().includes(q) && !s.enrollmentNo.toLowerCase().includes(q)) return false;
      if (filterDept !== "all" && s.department !== filterDept) return false;
      if (filterSemType !== "all") {
        if (filterSemType === "odd" && s.semester % 2 === 0) return false;
        if (filterSemType === "even" && s.semester % 2 !== 0) return false;
      }
      return true;
    });
  };

  const currentList = activeTab === "new" ? newAdmissions : activeTab === "semester" ? students : blockedStudents;
  const filtered = getFilteredList(currentList);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admissions & Registration</h1>
        <p className="mt-2 text-muted-foreground">Manage new admissions, semester registrations, and blocked students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              New Admissions <UserPlus className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{newAdmissions.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Sem 1-2 students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Odd Semester <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{oddSemStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Sem 1, 3, 5, 7</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Even Semester <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{evenSemStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Sem 2, 4, 6, 8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Blocked <XCircle className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedStudents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Due to pending fees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">New Admissions</TabsTrigger>
          <TabsTrigger value="semester">Semester Registration</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Students</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              {activeTab === "new" ? "New Registrations" : activeTab === "semester" ? "Semester-wise Registration" : "Blocked Due to Dues"}
            </CardTitle>
            <CardDescription>
              {activeTab === "blocked" ? "Students blocked from registration due to overdue fees or high pending amounts" : "Filter and manage student registrations"}
            </CardDescription>
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
              {activeTab === "semester" && (
                <Select value={filterSemType} onValueChange={setFilterSemType}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semester Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="odd">Odd Semesters</SelectItem>
                    <SelectItem value="even">Even Semesters</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {(searchQuery || filterDept !== "all" || filterSemType !== "all") && (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setSearchQuery(""); setFilterDept("all"); setFilterSemType("all"); }}>Clear</Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Sem</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const feeStatus = studentFeeStatus[s.enrollmentNo];
                  const isBlocked = feeStatus && (feeStatus.overdueCount > 0 || feeStatus.totalDue > 10000);
                  return (
                    <TableRow key={s.enrollmentNo}>
                      <TableCell className="font-medium">{s.enrollmentNo}</TableCell>
                      <TableCell>{s.firstName} {s.lastName}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.program || "N/A"}</TableCell>
                      <TableCell>{s.semester}</TableCell>
                      <TableCell>
                        <span className={s.cgpa < 6 ? "text-red-500 font-bold" : ""}>{s.cgpa.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {feeStatus?.hasDues ? (
                          <Badge variant={feeStatus.overdueCount > 0 ? "destructive" : "outline"} className="text-[10px]">
                            ₹{feeStatus.totalDue} due
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Clear</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">Eligible</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No students match the current filters.</div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
