import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { findUserByIdentifier } from "@/lib/db-models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Email or Unique ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const matched = await findUserByIdentifier(db, identifier);

    if (!matched) {
      // For security, researchers recommend not revealing if a user exists.
      // But for a college project, a clear error is often more helpful.
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate a 6-digit numeric code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const collectionName = matched.role === "student" ? "students" : matched.role === "faculty" ? "faculty" : "admins";
    const query = matched.role === "student" ? { enrollmentNo: matched.uniqueId } : matched.role === "faculty" ? { employeeId: matched.uniqueId } : { adminId: matched.uniqueId };

    await db.collection(collectionName).updateOne(query, {
      $set: {
        resetCode: resetCode,
        resetCodeExpires: expiry,
        updatedAt: new Date()
      }
    });

    // In a real production app, you would send an email here.
    // For this local college project, we'll return the code in the response 
    // so the user can "paste it" into the browser as they requested.
    console.log(`[AUTH] Reset code for ${identifier}: ${resetCode}`);

    return NextResponse.json({
      success: true,
      message: "Reset code generated and stored successfully",
      // Intentionally including the code in response for local demo/testing
      // This mimics the "loophole" effect of seeing standard codes during development
      debugCode: resetCode 
    });

  } catch (error) {
    console.error("[RESET_REQUEST] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
