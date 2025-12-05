import { NextRequest, NextResponse } from "next/server";

const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

type LoginAttemptsEntry = {
  count: number;
  firstAttemptAt: number;
};

const loginAttempts = new Map<string, LoginAttemptsEntry>();

function getClientKey(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ip = xForwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function isRateLimited(key: string, now: number): boolean {
  const entry = loginAttempts.get(key);
  if (!entry) return false;

  if (now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }

  return entry.count >= MAX_LOGIN_ATTEMPTS;
}

function registerLoginFailure(key: string, now: number) {
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
}

function resetLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

// POST /api/admin/login
// Recibe un token (por formulario o JSON) y, si coincide con
// ROOT_DASHBOARD_TOKEN, establece una cookie de sesión de admin y
// redirige al dashboard (/admin/sessions).
export async function POST(request: NextRequest) {
  const now = Date.now();
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey, now)) {
    return NextResponse.json(
      {
        error:
          "Demasiados intentos de acceso al dashboard root. Inténtalo de nuevo más tarde."
      },
      { status: 429 }
    );
  }

  const expected = process.env.ROOT_DASHBOARD_TOKEN;

  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ROOT_DASHBOARD_TOKEN no está configurado en el entorno del servidor."
      },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin");
  const hostOrigin = request.nextUrl.origin;

  if (origin && origin !== hostOrigin) {
    return NextResponse.json(
      {
        error:
          "Origen no permitido para el login del dashboard root."
      },
      { status: 403 }
    );
  }

  let token: string | null = null;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as
        | { token?: string }
        | null;
      token = body?.token ?? null;
    } else {
      const formData = await request.formData();
      const raw = formData.get("token");
      token = raw ? String(raw) : null;
    }
  } catch {
    token = null;
  }

  if (!token || token !== expected) {
    registerLoginFailure(clientKey, now);

    const url = new URL("/admin/login", request.nextUrl.origin);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url);
  }

  const redirectUrl = new URL("/admin/sessions", request.nextUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("admin_session", "active", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8 // 8 horas
  });

  resetLoginAttempts(clientKey);

  return response;
}
