"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { mockFees } from "@/lib/mockData";
import { getAuthToken } from "@/lib/auth";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FeeStatus = "Paid" | "Pending" | "Overdue";
type PaymentMethod = "UPI" | "Card" | "Netbanking";

interface FeeRecord {
  id?: string;
  feeId?: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: FeeStatus;
  modeOfPayment?: string;
  category?: string;
  semester?: number;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number): string => inrFormatter.format(amount);

const formatDate = (date?: string): string => {
  if (!date) return "Not available";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadgeVariant = (status: FeeStatus): "secondary" | "outline" | "destructive" => {
  if (status === "Paid") return "secondary";
  if (status === "Overdue") return "destructive";
  return "outline";
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>(mockFees as FeeRecord[]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [lastTransaction, setLastTransaction] = useState<{
    paymentId: string;
    receiptNo: string;
    amount: number;
    method: string;
  } | null>(null);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/fees", {
        headers: getAuthHeaders(),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Failed to fetch fees");
        return;
      }

      setFees((payload.data || []) as FeeRecord[]);
    } catch (error) {
      console.error("[v0] Error fetching fees:", error);
      toast.error("Unable to fetch live fees. Showing local demo data.");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void fetchFees();
  }, [fetchFees]);

  const totalFees = useMemo(() => fees.reduce((sum, fee) => sum + fee.amount, 0), [fees]);
  const paidFees = useMemo(() => fees.filter((fee) => fee.status === "Paid"), [fees]);
  const paidAmount = useMemo(() => paidFees.reduce((sum, fee) => sum + fee.amount, 0), [paidFees]);
  const pendingFees = useMemo(
    () => fees.filter((fee) => fee.status === "Pending" || fee.status === "Overdue"),
    [fees]
  );
  const overdueCount = useMemo(() => fees.filter((fee) => fee.status === "Overdue").length, [fees]);
  const pendingAmount = totalFees - paidAmount;
  const completionRate = totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0;
  const latestSemester = useMemo(() => Math.max(...fees.map((fee) => fee.semester ?? 0), 0), [fees]);

  const handlePayNow = async () => {
    if (pendingFees.length === 0) {
      toast.success("No pending dues.");
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const payableIds = pendingFees
        .map((fee) => fee.feeId || fee.id)
        .filter((id): id is string => Boolean(id));
      const response = await fetch("/api/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          feeIds: payableIds,
          paymentMethod,
        }),
      });
      const payload = await response.json();

      if (!payload.success) {
        toast.error(payload.message || "Payment failed");
        return;
      }

      setFees((current) => ((payload.data?.fees as FeeRecord[] | undefined) ?? current));
      setLastTransaction(payload.data?.transaction || null);
      setIsCheckoutOpen(false);
      toast.success(`Payment successful via Razorpay Demo: ${payload.data?.transaction?.paymentId || ""}`);
    } catch (error) {
      console.error("[v0] Payment error:", error);
      toast.error("Payment failed, please retry");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading fee ledger...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Student Fee Ledger</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Track your dues, payments, receipts, and checkout status in one place.
          </p>
        </div>
        {pendingAmount > 0 && (
          <Button onClick={() => setIsCheckoutOpen(true)} className="gap-2 w-full md:w-auto">
            <CreditCard className="h-4 w-4" />
            Pay {formatCurrency(pendingAmount)}
          </Button>
        )}
      </div>

      {pendingAmount > 0 && (
        <Alert className="border-amber-400/40 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            Outstanding dues: <span className="font-semibold">{formatCurrency(pendingAmount)}</span>. Please clear pending items to avoid late penalties.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-end">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {latestSemester > 0 ? `Semester ${latestSemester}` : "Current Session"} payment overview
                </p>
                <h2 className="text-xl font-semibold md:text-2xl">{formatCurrency(totalFees)} billed</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-background/90 p-3">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-base font-semibold text-green-600">{formatCurrency(paidAmount)}</p>
                </div>
                <div className="rounded-xl border bg-background/90 p-3">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className={`mt-1 text-base font-semibold ${pendingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
                <div className="rounded-xl border bg-background/90 p-3">
                  <p className="text-xs text-muted-foreground">Pending Items</p>
                  <p className="mt-1 text-base font-semibold">{pendingFees.length}</p>
                </div>
                <div className="rounded-xl border bg-background/90 p-3">
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className={`mt-1 text-base font-semibold ${overdueCount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {overdueCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Items</CardTitle>
          <CardDescription>Complete ledger entries with due dates and status tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {fees.map((fee) => (
              <div key={fee.feeId || fee.id || fee.description} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-tight">{fee.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fee.category || "General Fee"}
                      {fee.semester ? ` • Sem ${fee.semester}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(fee.amount)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">Due {formatDate(fee.dueDate)}</p>
                  <Badge variant={statusBadgeVariant(fee.status)}>{fee.status}</Badge>
                </div>
                {fee.status === "Paid" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Paid on {formatDate(fee.paidDate)} via {fee.modeOfPayment || "Online"}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Head</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.feeId || fee.id || fee.description}>
                    <TableCell>
                      <p className="font-medium">{fee.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {fee.category || "General Fee"}
                        {fee.semester ? ` • Semester ${fee.semester}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(fee.dueDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(fee.status)}>{fee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fee.status === "Paid"
                        ? `${fee.modeOfPayment || "Online"} • ${formatDate(fee.paidDate)}`
                        : "Not paid yet"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pendingAmount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Payment Options</CardTitle>
            <CardDescription>Choose a payment mode to clear outstanding dues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/90 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Razorpay Demo
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Instant demo checkout for testing flow.</p>
              </div>
              <div className="rounded-lg border bg-background/90 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Landmark className="h-4 w-4 text-primary" />
                  Bank Transfer
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Mark payment after manual verification.</p>
              </div>
              <div className="rounded-lg border bg-background/90 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-primary" />
                  Campus Counter
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Offline cash/card at finance office.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setIsCheckoutOpen(true)} disabled={isProcessing} className="gap-2 flex-1">
                <CreditCard className="h-4 w-4" />
                Pay with Razorpay Demo
              </Button>
              <Button variant="outline" className="flex-1">
                Pay Offline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Receipts and settled records</CardDescription>
        </CardHeader>
        <CardContent>
          {paidFees.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <ReceiptText className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No payments recorded yet</p>
              <p className="text-xs text-muted-foreground">Paid fee entries will appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {paidFees.map((fee) => (
                  <div key={fee.feeId || fee.id || fee.description} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium leading-tight">{fee.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(fee.paidDate)}</p>
                      </div>
                      <Badge variant="secondary">Paid</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatCurrency(fee.amount)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-primary"
                        onClick={() => toast.success("Receipt download demo only")}
                      >
                        <Download className="h-4 w-4" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paid On</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidFees.map((fee) => (
                      <TableRow key={fee.feeId || fee.id || fee.description}>
                        <TableCell className="text-sm">{formatDate(fee.paidDate)}</TableCell>
                        <TableCell className="text-sm">{fee.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fee.modeOfPayment || "Online"}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary"
                            onClick={() => toast.success("Receipt download demo only")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {lastTransaction && (
        <Alert className="border-green-400/40 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm">
            Payment complete: <span className="font-semibold">{lastTransaction.paymentId}</span> • Receipt{" "}
            <span className="font-semibold">{lastTransaction.receiptNo}</span> • {formatCurrency(lastTransaction.amount)} via{" "}
            <span className="font-semibold">{lastTransaction.method}</span>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-sm">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <CalendarClock className="h-4 w-4 mt-0.5 text-primary" />
            <p>Late payment can attract a fine of 1% per week.</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-primary" />
            <p>Keep your receipts and transaction IDs for verification.</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-primary" />
            <p>Contact Finance Office for failed or duplicate transactions.</p>
          </div>
          <div className="flex items-start gap-2">
            <ReceiptText className="h-4 w-4 mt-0.5 text-primary" />
            <p>Payment acknowledgments are generated automatically.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Fee Payment Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terms">
              <AccordionTrigger>Read full terms</AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. All fees must be paid by the due date mentioned in the fee notice.</p>
                <p>2. Late payments may incur a penalty of 1% per week on the outstanding amount.</p>
                <p>3. This portal includes a Razorpay-like demo gateway for non-production testing.</p>
                <p>4. Refunds are processed only in official withdrawal cases as per policy.</p>
                <p>5. Keep digital or printed receipts for audit and reference.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Razorpay Demo Checkout</DialogTitle>
            <DialogDescription>Secure demo checkout flow for ERP fee payments.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payable items</span>
                  <span>{pendingFees.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total amount</span>
                  <span className="font-semibold">{formatCurrency(pendingAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-medium">Choose payment method</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={paymentMethod === "UPI" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <Smartphone className="h-4 w-4" />
                  UPI
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "Card" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setPaymentMethod("Card")}
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "Netbanking" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setPaymentMethod("Netbanking")}
                >
                  <Landmark className="h-4 w-4" />
                  Bank
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Encrypted demo checkout session (test mode only)
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayNow} className="flex-1 gap-2" disabled={isProcessing}>
                <CreditCard className="h-4 w-4" />
                {isProcessing ? "Processing..." : `Pay ${formatCurrency(pendingAmount)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
