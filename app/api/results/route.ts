import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const db = await getDatabase();
    
    if (session.role === "student") {
       // Query actual results collection
       const results = await db.collection("results").find({ enrollmentNo: session.enrollmentNo }).toArray();
       
       if (results.length === 0) {
         // Return empty if no real results exist, rather than fake ones
         return NextResponse.json({ success: true, data: [] }, { status: 200 });
       }
       return NextResponse.json({ success: true, data: results }, { status: 200 });
    }
    
    if (session.role === "faculty") {
       // Faculty gets results for subjects they teach
       const results = await db.collection("results").find({ facultyId: session.employeeId }).toArray();
       return NextResponse.json({ success: true, data: results }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
