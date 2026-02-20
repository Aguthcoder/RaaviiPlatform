import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/about", "/events"];
const AUTH_PATHS = ["/login"];

// همان لیست ادمین‌ها که در api.ts و بک‌اند تعریف شده
const ADMIN_PHONES = [
  "09356815523",
  "09929564895",
  "09933830958",
  "09055508305",
  "09053241505",
];

function decodeToken(token?: string) {
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return payload;
  } catch {
    return null;
  }
}

function isAdminPayload(payload: any): boolean {
  if (!payload) return false;
  // چک role === 'admin' برای کاربرانی که role درست دارن
  if (payload.role === "admin") return true;
  // چک شماره تلفن برای ادمین‌هایی که با phone شناسایی می‌شن
  const phone = (payload.mobileNumber || payload.phone || "")
    .replace(/[\s\-+]/g, "")
    .replace(/^98/, "0");
  return ADMIN_PHONES.includes(phone);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and api routes (api/* به بک‌اند پروکسی می‌شه توسط next.config.js)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // توکن از کوکی — اگه لاگین با cookie بود
  const tokenFromCookie = request.cookies.get("token")?.value;
  // توکن از هدر Authorization
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const token = tokenFromCookie || tokenFromHeader;
  const payload = decodeToken(token);
  const isLoggedIn = !!payload;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Redirect logged-in users away from login page
  if (isLoggedIn && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ چک ادمین بر اساس شماره تلفن یا role
  // قبلاً فقط role === "admin" چک می‌شد که باعث redirect همیشگی ادمین‌ها می‌شد
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || !isAdminPayload(payload)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Dashboard و صفحات protected: client-side AuthGate مدیریت می‌کنه
  // (چون توکن در localStorage هست و middleware به اون دسترسی نداره)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
