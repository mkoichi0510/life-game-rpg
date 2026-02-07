import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";

/**
 * Auth.js v5 の `auth()` を Next.js 16 の proxy 規約として使用。
 * `auth()` は内部で NextAuth ミドルウェアを返すため、
 * `export default auth(...)` でリクエストのインターセプトが可能。
 * @see https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware
 */
export default auth((request) => {
  if (process.env.E2E_AUTH_BYPASS === "1") {
    return NextResponse.next();
  }

  if (request.auth?.user) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ROUTES.LOGIN;
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|login|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|map)$).*)",
  ],
};
