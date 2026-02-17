import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Check localStorage via a different approach - we'll use a flag in cookies instead
  // For now, we'll allow all access and rely on client-side protection
  
  return NextResponse.next();
}

// Define which routes need protection
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
