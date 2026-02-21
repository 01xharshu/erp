"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";
import { toast } from "sonner";
import { IndianRupee, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalRecords: 0,
    totalCollected: 0,
    totalPending: 0,
    overdueCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | FeeStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFees = async (nextFilter: "all" | FeeStatus) => {
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
      setSummary(payload.summary || summary);
    } catch (error) {
      console.error("[v0] Failed to fetch fee records:", error);
      toast.error("Failed to fetch fee records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees(statusFilter);
  }, []);

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
        <div className="w-full md:w-56">
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | FeeStatus) => {
              setStatusFilter(value);
              fetchFees(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                {fees.map((fee) => (
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

          {fees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No fee records found for this filter.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
