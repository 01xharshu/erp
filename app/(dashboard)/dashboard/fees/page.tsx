"use client";

import { useState } from "react";
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
import { AlertTriangle, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";

export default function FeesPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  // Fee structure
  const feeStructure = [
    { category: "Tuition Fee", amount: 50000, paid: true },
    { category: "Examination Fee", amount: 5000, paid: true },
    { category: "Library Fee", amount: 2000, paid: false },
    { category: "Lab Fee", amount: 3000, paid: false },
    { category: "Activity Fee", amount: 1500, paid: false },
  ];

  const totalFees = feeStructure.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = feeStructure
    .filter((f) => f.paid)
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = totalFees - paidAmount;

  const handlePayNow = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Redirecting to payment gateway...");
    // In a real app, this would redirect to Razorpay/PayU
    setIsProcessing(false);
  };

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
            <p className="text-xs text-muted-foreground mt-1">Semester 3</p>
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
              {mockFees.filter((f) => f.status === "Pending").length} item(s)
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
                  <Badge variant={fee.paid ? "secondary" : "outline"}>
                    {fee.paid ? "Paid" : "Pending"}
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
                <li>Online Payment (Razorpay, PayU, etc.)</li>
                <li>Bank Transfer</li>
                <li>Cash Payment at College Counter</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="gap-2 flex-1"
              >
                <CreditCard className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Pay Online"}
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
                {mockFees
                  .filter((f) => f.status === "Paid")
                  .map((fee) => (
                    <TableRow key={fee.id}>
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
                <p>3. Payments made online are processed through secure gateways (Razorpay/PayU).</p>
                <p>4. Refunds are only processed in case of official withdrawal as per college policy.</p>
                <p>5. Keep digital/physical receipts for future reference.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}