import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const adminSession = requireAdminSession(request);
  if (adminSession instanceof NextResponse) return adminSession;

  try {
    const db = await getDatabase();
    
    // Aggregation to get pass rates and stats by exam
    const results = await db.collection("results").aggregate([
      {
        $group: {
          _id: { examId: "$examId", program: "$program", semester: "$semester" },
          totalStudents: { $sum: 1 },
          passedStudents: {
            $sum: { $cond: [{ $gte: ["$marks", 40] }, 1, 0] } // Assuming pass mark is 40
          },
          examName: { $first: "$examName" },
          publishedOn: { $first: "$publishedOn" },
          status: { $first: "$status" }
        }
      },
      {
        $project: {
          _id: 0,
          id: "$_id.examId",
          examName: 1,
          program: "$_id.program",
          semester: "$_id.semester",
          publishedOn: 1,
          passPercentage: {
            $round: [{ $multiply: [{ $divide: ["$passedStudents", "$totalStudents"] }, 100] }, 1]
          },
          status: 1
        }
      },
      { $sort: { publishedOn: -1 } }
    ]).toArray();
    
    // If no real results, we just return empty
    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
