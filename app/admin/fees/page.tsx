"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { IndianRupee, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FeeStatus = "Paid" | "Pending" | "Overdue";

interface FeeRecord {
  _id: string;
  feeId: string;
  enrollmentNo: string;
  description: string;
  category: string;
  semester: number;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
  modeOfPayment?: string;
  gateway?: string;
  paymentId?: string;
  receiptNo?: string;
}

interface FeeSummary {
  totalRecords: number;
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
}

const defaultSummary: FeeSummary = {
  totalRecords: 0,
  totalCollected: 0,
  totalPending: 0,
  overdueCount: 0,
};

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<FeeSummary>(defaultSummary);
  const [statusFilter, setStatusFilter] = useState<"all" | FeeStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // ─── Extra Filter State ───
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      if (enrollmentSearch && !f.enrollmentNo.toLowerCase().includes(enrollmentSearch.toLowerCase())) return false;
      if (semesterFilter !== "all" && String(f.semester) !== semesterFilter) return false;
      if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
      return true;
    });
  }, [fees, enrollmentSearch, semesterFilter, categoryFilter]);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchFees = useCallback(async (nextFilter: "all" | FeeStatus) => {
    setIsLoading(true);
    try {
      const query = nextFilter === "all" ? "" : `?status=${nextFilter}`;
      const response = await fetch(`/api/admin/fees${query}`, {
        headers: getAuthHeaders(),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to fetch fee records");
        return;
      }

      setFees(payload.data || []);
      setSummary(payload.summary || defaultSummary);
    } catch (error) {
      console.error("[v0] Failed to fetch fee records:", error);
      toast.error("Failed to fetch fee records");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchFees(statusFilter);
  }, [fetchFees, statusFilter]);

  const updateFeeStatus = async (feeId: string, status: FeeStatus) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/fees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          feeId,
          status,
          modeOfPayment: status === "Paid" ? "Offline" : undefined,
        }),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to update fee status");
        return;
      }

      toast.success(`Fee marked as ${status}`);
      await fetchFees(statusFilter);
    } catch (error) {
      console.error("[v0] Failed to update fee status:", error);
      toast.error("Failed to update fee status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewStudent = async (fee: FeeRecord) => {
    setSelectedFee(fee);
    setIsModalLoading(true);

    try {
      const response = await fetch(`/api/admin/students?enrollmentNo=${fee.enrollmentNo}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setSelectedStudent(data.data[0]);
      } else {
        setSelectedStudent(null);
      }
    } catch {
      setSelectedStudent(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        title: "Total Collected",
        value: `₹${summary.totalCollected}`,
        description: "Successfully paid fees",
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      },
      {
        title: "Pending Dues",
        value: `₹${summary.totalPending}`,
        description: "Pending + overdue amount",
        icon: <IndianRupee className="h-4 w-4 text-amber-600" />,
      },
      {
        title: "Overdue Items",
        value: `${summary.overdueCount}`,
        description: "Fees crossing due date",
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      },
      {
        title: "Fee Records",
        value: `${summary.totalRecords}`,
        description: "All student fee entries",
        icon: <RotateCcw className="h-4 w-4 text-primary" />,
      },
    ],
    [summary]
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fees Management</h1>
          <p className="text-muted-foreground mt-2">Monitor payments, pending dues, and mark settlement status</p>
        </div>
      </div>

      {/* ─── Enhanced Filter Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Input
          placeholder="Search enrollment no..."
          value={enrollmentSearch}
          onChange={(e) => setEnrollmentSearch(e.target.value)}
          className="rounded-xl"
        />
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | FeeStatus) => {
            setStatusFilter(value);
            fetchFees(value);
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {[...new Set(fees.map(f => f.semester))].sort((a, b) => a - b).map(s => (
              <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {[...new Set(fees.map(f => f.category))].sort().map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(enrollmentSearch || statusFilter !== "all" || semesterFilter !== "all" || categoryFilter !== "all") && (
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setEnrollmentSearch(""); setStatusFilter("all"); setSemesterFilter("all"); setCategoryFilter("all"); fetchFees("all"); }}>Clear All</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {stat.title}
                {stat.icon}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fee Ledger</CardTitle>
          <CardDescription>
            Mark pending fees as paid after offline settlement or escalate overdue accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.feeId}>
                    <TableCell className="font-medium">{fee.enrollmentNo}</TableCell>
                    <TableCell>
                      <p className="font-medium">{fee.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {fee.category} • Sem {fee.semester}
                      </p>
                    </TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.status === "Paid" ? "secondary" : fee.status === "Overdue" ? "destructive" : "outline"}
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {fee.status === "Paid" ? `${fee.modeOfPayment || "N/A"} • ${fee.paidDate || ""}` : "Not paid"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewStudent(fee)}
                      >
                        Details
                      </Button>
                      {fee.status !== "Paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSaving}
                          onClick={() => updateFeeStatus(fee.feeId, "Paid")}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {fee.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isSaving}
                          onClick={() => updateFeeStatus(fee.feeId, "Overdue")}
                        >
                          Mark Overdue
                        </Button>
                      )}
                      {fee.status === "Overdue" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isSaving}
                          onClick={() => updateFeeStatus(fee.feeId, "Pending")}
                        >
                          Set Pending
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No fee records match the current filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Student Fee Modal Reference */}
      <Dialog open={!!selectedFee} onOpenChange={(open) => !open && setSelectedFee(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fee & Student Details</DialogTitle>
            <DialogDescription>
              Comprehensive information regarding the selected fee entry.
            </DialogDescription>
          </DialogHeader>

          {isModalLoading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Student</p>
                  <p className="font-semibold text-foreground text-lg mb-0.5">
                    {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "Unknown"}
                  </p>
                  <p className="text-sm font-medium text-primary">ENR: {selectedFee?.enrollmentNo}</p>
                  {selectedStudent && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedStudent.program || selectedStudent.department} • Year {selectedStudent.year}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  <p className="font-semibold text-foreground text-lg mb-0.5">₹{selectedFee?.amount}</p>
                  <div className="mt-1">
                    <Badge variant={selectedFee?.status === "Paid" ? "secondary" : selectedFee?.status === "Overdue" ? "destructive" : "outline"}>
                      {selectedFee?.status}
                    </Badge>
                  </div>
                  {selectedFee?.status === "Paid" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      via {selectedFee.modeOfPayment} on {selectedFee.paidDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-semibold mb-3 text-foreground">Entry Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground font-medium">Description</span>
                    <span className="font-semibold">{selectedFee?.description}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground font-medium">Category</span>
                    <span className="font-semibold">{selectedFee?.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground font-medium">Semester Target</span>
                    <span className="font-semibold">Semester {selectedFee?.semester}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground font-medium">Due Date</span>
                    <span className="font-semibold text-destructive">{selectedFee?.dueDate}</span>
                  </div>
                </div>
              </div>

              {selectedFee?.status !== "Paid" && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1" 
                    variant="default"
                    onClick={() => {
                      updateFeeStatus(selectedFee!.feeId, "Paid");
                      setSelectedFee(null);
                    }}
                  >
                    Mark as Paid Offline
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
