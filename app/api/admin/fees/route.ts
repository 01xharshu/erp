import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { FeeStatus, PaymentMethod, getAllFees, markFeeStatus, markOverdueFeesByDueDate } from "@/lib/fee-models";
import { getDatabase } from "@/lib/mongodb";

const statuses: FeeStatus[] = ["Paid", "Pending", "Overdue"];
const paymentMethods: PaymentMethod[] = ["UPI", "Card", "Netbanking", "Offline", "Online Transfer"];

const serializeFees = (fees: Awaited<ReturnType<typeof getAllFees>>) =>
  fees.map(({ _id, ...rest }) => ({
    ...rest,
    _id: _id?.toString() ?? "",
  }));

export async function GET(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const db = await getDatabase();
    await markOverdueFeesByDueDate(db);

    const statusParam = request.nextUrl.searchParams.get("status");
    const enrollmentNo = request.nextUrl.searchParams.get("enrollmentNo");
    const status = statusParam && statuses.includes(statusParam as FeeStatus) ? (statusParam as FeeStatus) : undefined;
    const fees = await getAllFees(db, {
      status,
      enrollmentNo: enrollmentNo ?? undefined,
    });
    const data = serializeFees(fees);
    const summary = {
      totalRecords: data.length,
      totalCollected: data.filter((fee) => fee.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0),
      totalPending: data
        .filter((fee) => fee.status === "Pending" || fee.status === "Overdue")
        .reduce((sum, fee) => sum + fee.amount, 0),
      overdueCount: data.filter((fee) => fee.status === "Overdue").length,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to fetch admin fee data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch fee data",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const feeId = String(body.feeId ?? "").trim();
    const status = String(body.status ?? "").trim() as FeeStatus;
    const modeOfPayment = body.modeOfPayment ? (String(body.modeOfPayment).trim() as PaymentMethod) : undefined;

    if (!feeId || !statuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid feeId and status are required",
        },
        { status: 400 }
      );
    }

    if (modeOfPayment && !paymentMethods.includes(modeOfPayment)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const updated = await markFeeStatus(db, feeId, status, modeOfPayment);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Fee record not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Fee status updated",
        data: {
          ...updated,
          _id: updated._id?.toString() ?? "",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to update fee status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update fee status",
      },
      { status: 500 }
    );
  }
}
