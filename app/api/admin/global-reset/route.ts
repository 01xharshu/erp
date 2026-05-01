import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";
import { findUserByIdentifier, hashPassword } from "@/lib/db-models";

/**
 * Admin API route for global password reset access.
 * Allows an authenticated admin to reset the password for ANY user account
 * (Student, Faculty, or another Admin) using their Email or Unique ID.
 */
export async function POST(request: NextRequest) {
  // 1. Verify that the requester is an authorized Admin
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim();
    const newPassword = String(body.newPassword || "").trim();

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Identifier and New Password are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // 2. Find the target user by their Email or ID
    const matched = await findUserByIdentifier(db, identifier);

    if (!matched) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 }
      );
    }

    // 3. Hash the new password securely
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update the user in the appropriate collection based on their role
    const collectionName = matched.role === "student" ? "students" : matched.role === "faculty" ? "faculty" : "admins";
    const query = matched.role === "student" 
      ? { enrollmentNo: matched.uniqueId } 
      : matched.role === "faculty" 
        ? { employeeId: matched.uniqueId } 
        : { adminId: matched.uniqueId };

    const result = await db.collection(collectionName).updateOne(query, {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
        // Clear any pending reset codes if they exist
        resetCode: null,
        resetCodeExpires: null
      }
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to update record" },
        { status: 500 }
      );
    }

    console.log(`[ADMIN_ACTION] Admin ${auth.uniqueId} reset password for user ${identifier}`);

    return NextResponse.json({
      success: true,
      message: `Password for ${identifier} (${matched.role}) has been updated successfully.`
    });

  } catch (error) {
    console.error("[GLOBAL_RESET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
