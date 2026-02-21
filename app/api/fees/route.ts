import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/api-auth";
import { PaymentMethod, getStudentFees, markOverdueFeesByDueDate, processDemoRazorpayPayment } from "@/lib/fee-models";
import { getDatabase } from "@/lib/mongodb";

const paymentMethods: PaymentMethod[] = ["UPI", "Card", "Netbanking", "Offline", "Online Transfer"];

const serializeFees = (fees: Awaited<ReturnType<typeof getStudentFees>>) =>
  fees.map(({ _id, ...rest }) => ({
    ...rest,
    _id: _id?.toString() ?? "",
  }));

export async function GET(request: NextRequest) {
  const auth = requireStudentSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const db = await getDatabase();
    await markOverdueFeesByDueDate(db);
    const fees = await getStudentFees(db, auth.uniqueId);
    const serialized = serializeFees(fees);
    const summary = {
      total: serialized.reduce((sum, fee) => sum + fee.amount, 0),
      paid: serialized.filter((fee) => fee.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0),
      pending: serialized
        .filter((fee) => fee.status === "Pending" || fee.status === "Overdue")
        .reduce((sum, fee) => sum + fee.amount, 0),
      overdueCount: serialized.filter((fee) => fee.status === "Overdue").length,
    };

    return NextResponse.json(
      {
        success: true,
        data: serialized,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to fetch student fees:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch fees",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireStudentSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const feeIds = Array.isArray(body.feeIds) ? body.feeIds.map((id: unknown) => String(id)) : [];
    const paymentMethod = String(body.paymentMethod ?? "UPI") as PaymentMethod;

    if (!paymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    if (feeIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No fee items selected",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const payment = await processDemoRazorpayPayment(db, auth.uniqueId, feeIds, paymentMethod);

    if (payment.totalPaid <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending fee found for selected items",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment successful (Razorpay Demo)",
        data: {
          fees: serializeFees(payment.updatedFees),
          transaction: {
            paymentId: payment.paymentId,
            receiptNo: payment.receiptNo,
            amount: payment.totalPaid,
            method: paymentMethod,
            gateway: "Razorpay Demo",
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to process payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
