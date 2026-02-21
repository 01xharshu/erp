import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { mockSubjects } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json(
    {
      success: true,
      data: mockSubjects,
    },
    { status: 200 }
  );
}
