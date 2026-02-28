import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/logout
// Elimina la cookie de sesión de admin y redirige a la pantalla de login.
export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/admin-login", request.nextUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
