"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockFees } from "@/lib/mockData";
import { getAuthToken } from "@/lib/auth";
import { AlertTriangle, CheckCircle2, CreditCard, Download, Landmark, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFees = async () => {
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
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const feeStructure = useMemo(
    () =>
      fees.map((fee) => ({
        ...fee,
        paid: fee.status === "Paid",
      })),
    [fees]
  );

  const totalFees = useMemo(() => feeStructure.reduce((sum, f) => sum + f.amount, 0), [feeStructure]);
  const paidAmount = useMemo(
    () => feeStructure.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0),
    [feeStructure]
  );
  const pendingFees = useMemo(
    () => fees.filter((fee) => fee.status === "Pending" || fee.status === "Overdue"),
    [fees]
  );
  const pendingAmount = totalFees - paidAmount;

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

      setFees((payload.data?.fees || fees) as FeeRecord[]);
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
    return <div className="flex items-center justify-center p-8">Loading fees...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Fees & Payments</h1>
        <p className="text-muted-foreground">
          View fee structure, dues, and payment history
        </p>
      </div>

      {/* Outstanding Dues Alert */}
      {pendingAmount > 0 && (
        <Alert className="border-accent/50 bg-accent/10">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <AlertDescription>
            You have outstanding dues of ₹{pendingAmount}. Please complete payment by the due date to avoid penalties.
          </AlertDescription>
        </Alert>
      )}

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{totalFees}</div>
            <p className="text-xs text-muted-foreground mt-1">Current term total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{paidAmount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((paidAmount / totalFees) * 100).toFixed(0)}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                pendingAmount > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ₹{pendingAmount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingFees.length} item(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>Semester 3 fee structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feeStructure.map((fee, idx) => (
              <div key={idx} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      fee.paid ? "bg-green-600" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{fee.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">₹{fee.amount}</span>
                  <Badge
                    variant={fee.status === "Paid" ? "secondary" : fee.status === "Overdue" ? "destructive" : "outline"}
                  >
                    {fee.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalFees}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {pendingAmount > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Outstanding Payment</CardTitle>
            <CardDescription>
              Amount due: ₹{pendingAmount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can pay your fees through:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                <li>Online Payment (Razorpay Demo checkout)</li>
                <li>Bank Transfer</li>
                <li>Cash Payment at College Counter</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={isProcessing}
                className="gap-2 flex-1"
              >
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

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Previous payments and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees
                  .filter((f) => f.status === "Paid")
                  .map((fee) => (
                    <TableRow key={fee.feeId || fee.id}>
                      <TableCell className="text-sm">{fee.paidDate}</TableCell>
                      <TableCell className="text-sm">{fee.description}</TableCell>
                      <TableCell className="font-medium">₹{fee.amount}</TableCell>
                      <TableCell className="text-sm">{fee.modeOfPayment}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {lastTransaction && (
        <Alert className="border-green-400/40 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Payment complete. Transaction `{lastTransaction.paymentId}` | Receipt `{lastTransaction.receiptNo}` | Amount ₹
            {lastTransaction.amount}
          </AlertDescription>
        </Alert>
      )}

      {/* Important Notes */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Late payment may attract a fine of 1% per week</li>
            <li>• Keep proof of payment for records</li>
            <li>• For payment issues, contact the Finance Office</li>
            <li>• Receipts are automatically generated and sent to your email</li>
          </ul>
        </CardContent>
      </Card>

      {/* Added section to use the imported Accordion components */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Fee Payment Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terms">
              <AccordionTrigger>Read full terms</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>1. All fees must be paid by the due date mentioned in the fee notice.</p>
                <p>2. Late payments will incur a penalty of 1% per week on the outstanding amount.</p>
                <p>3. This portal includes a Razorpay-like demo gateway for non-production testing.</p>
                <p>4. Refunds are only processed in case of official withdrawal as per college policy.</p>
                <p>5. Keep digital/physical receipts for future reference.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Razorpay Demo Checkout</DialogTitle>
            <DialogDescription>
              Secure demo checkout flow for ERP fee payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{pendingFees.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">₹{pendingAmount}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-medium">Choose payment method</p>
              <div className="grid grid-cols-3 gap-2">
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
                {isProcessing ? "Processing..." : `Pay ₹${pendingAmount}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
