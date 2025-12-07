import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin protection
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session_token")?.value;
    if (!session) {
      const loginUrl = new URL("/admin-login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Dashboard protection
  if (pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("merchant_session")?.value;
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
