import { Db, ObjectId } from "mongodb";

export type FeeStatus = "Paid" | "Pending" | "Overdue";
export type PaymentMethod = "UPI" | "Card" | "Netbanking" | "Offline" | "Online Transfer";

export interface FeeRecord {
  _id?: ObjectId;
  feeId: string;
  enrollmentNo: string;
  description: string;
  category: string;
  semester: number;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
  modeOfPayment?: PaymentMethod;
  gateway?: string;
  paymentId?: string;
  receiptNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const normalizeEnrollmentNo = (enrollmentNo: string): string => enrollmentNo.trim().toUpperCase();

const toIsoDate = (value: Date): string => value.toISOString().split("T")[0];

const generatePaymentId = (): string => `pay_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const generateReceiptNo = (): string => `RCPT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export async function createFeeRecord(
  db: Db,
  feeData: Omit<FeeRecord, "_id" | "createdAt" | "updatedAt">
): Promise<FeeRecord> {
  const now = new Date();
  const normalized: FeeRecord = {
    ...feeData,
    enrollmentNo: normalizeEnrollmentNo(feeData.enrollmentNo),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<FeeRecord>("fees").insertOne(normalized);

  return {
    ...normalized,
    _id: result.insertedId,
  };
}

export async function getStudentFees(db: Db, enrollmentNo: string): Promise<FeeRecord[]> {
  return db
    .collection<FeeRecord>("fees")
    .find({ enrollmentNo: normalizeEnrollmentNo(enrollmentNo) })
    .sort({ dueDate: 1, createdAt: 1 })
    .toArray();
}

export async function getAllFees(
  db: Db,
  filters?: { status?: FeeStatus; enrollmentNo?: string }
): Promise<FeeRecord[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status) {
    query.status = filters.status;
  }
  if (filters?.enrollmentNo) {
    query.enrollmentNo = normalizeEnrollmentNo(filters.enrollmentNo);
  }

  return db.collection<FeeRecord>("fees").find(query).sort({ updatedAt: -1 }).toArray();
}

export async function markFeeStatus(
  db: Db,
  feeId: string,
  status: FeeStatus,
  modeOfPayment?: PaymentMethod
): Promise<FeeRecord | null> {
  const updatePayload: Partial<FeeRecord> = {
    status,
    updatedAt: new Date(),
  };
  const unsetPayload: Record<string, ""> = {};

  if (status === "Paid") {
    updatePayload.paidDate = toIsoDate(new Date());
    updatePayload.modeOfPayment = modeOfPayment ?? "Offline";
    updatePayload.gateway = modeOfPayment === "Offline" ? "Manual Settlement" : "Razorpay Demo";
    updatePayload.paymentId = generatePaymentId();
    updatePayload.receiptNo = generateReceiptNo();
  }

  if (status === "Pending" || status === "Overdue") {
    unsetPayload.paidDate = "";
    unsetPayload.modeOfPayment = "";
    unsetPayload.gateway = "";
    unsetPayload.paymentId = "";
    unsetPayload.receiptNo = "";
  }

  const updateQuery: { $set: Partial<FeeRecord>; $unset?: Record<string, ""> } = {
    $set: updatePayload,
  };
  if (Object.keys(unsetPayload).length > 0) {
    updateQuery.$unset = unsetPayload;
  }

  return db.collection<FeeRecord>("fees").findOneAndUpdate({ feeId }, updateQuery, { returnDocument: "after" });
}

export async function markOverdueFeesByDueDate(db: Db): Promise<number> {
  const today = toIsoDate(new Date());
  const result = await db.collection<FeeRecord>("fees").updateMany(
    {
      status: "Pending",
      dueDate: { $lt: today },
    },
    {
      $set: {
        status: "Overdue",
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
}

export async function processDemoRazorpayPayment(
  db: Db,
  enrollmentNo: string,
  feeIds: string[],
  paymentMethod: PaymentMethod
): Promise<{
  updatedFees: FeeRecord[];
  totalPaid: number;
  paymentId: string;
  receiptNo: string;
}> {
  const normalizedEnrollment = normalizeEnrollmentNo(enrollmentNo);

  const payableFees = await db
    .collection<FeeRecord>("fees")
    .find({
      enrollmentNo: normalizedEnrollment,
      feeId: { $in: feeIds },
      status: { $in: ["Pending", "Overdue"] },
    })
    .toArray();

  if (payableFees.length === 0) {
    return {
      updatedFees: await getStudentFees(db, normalizedEnrollment),
      totalPaid: 0,
      paymentId: "",
      receiptNo: "",
    };
  }

  const paymentId = generatePaymentId();
  const receiptNo = generateReceiptNo();
  const paidDate = toIsoDate(new Date());
  const totalPaid = payableFees.reduce((sum, fee) => sum + fee.amount, 0);

  await db.collection<FeeRecord>("fees").updateMany(
    {
      enrollmentNo: normalizedEnrollment,
      feeId: { $in: feeIds },
      status: { $in: ["Pending", "Overdue"] },
    },
    {
      $set: {
        status: "Paid",
        paidDate,
        modeOfPayment: paymentMethod,
        gateway: "Razorpay Demo",
        paymentId,
        receiptNo,
        updatedAt: new Date(),
      },
    }
  );

  const updatedFees = await getStudentFees(db, normalizedEnrollment);

  return {
    updatedFees,
    totalPaid,
    paymentId,
    receiptNo,
  };
}
