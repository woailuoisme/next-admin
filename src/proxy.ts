import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_token";

const PROTECTED_PREFIXES = [
  "/overview",
  "/dashboard",
  "/products",
  "/categories",
  "/orders",
  "/users",
  "/showcase",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1. 根路径或旧 /dashboard 重定向至 /overview
  if (pathname === "/" || pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // 2. 登录页拦截：已登录用户重定向至 /overview
  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  // 3. 受保护路由拦截：未登录用户重定向至 /login 并附带原始回跳路径
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    const fromPath = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname;
    loginUrl.searchParams.set("from", fromPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
