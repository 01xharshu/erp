import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { findUserByIdentifier, hashPassword } from "@/lib/db-models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, code, newPassword } = body;

    if (!identifier || !code || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const matched = await findUserByIdentifier(db, identifier);

    if (!matched) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const user = matched.user as any;

    if (!user.resetCode || user.resetCode !== code) {
      return NextResponse.json(
        { success: false, message: "Invalid reset code" },
        { status: 401 }
      );
    }

    if (new Date() > new Date(user.resetCodeExpires)) {
      return NextResponse.json(
        { success: false, message: "Reset code has expired" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    const collectionName = matched.role === "student" ? "students" : matched.role === "faculty" ? "faculty" : "admins";
    const query = matched.role === "student" ? { enrollmentNo: matched.uniqueId } : matched.role === "faculty" ? { employeeId: matched.uniqueId } : { adminId: matched.uniqueId };

    await db.collection(collectionName).updateOne(query, {
      $set: {
        password: hashedNewPassword,
        updatedAt: new Date()
      },
      $unset: {
        resetCode: "",
        resetCodeExpires: ""
      }
    });

    console.log(`[AUTH] Password updated for ${identifier}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("[RESET_PASSWORD] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
