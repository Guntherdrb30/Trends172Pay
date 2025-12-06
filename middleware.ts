import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminPage && !isLoginPage) {
    const session = request.cookies.get("admin_session")?.value;
    if (session !== "active") {
      const loginUrl = new URL("/admin/login", request.url);
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
