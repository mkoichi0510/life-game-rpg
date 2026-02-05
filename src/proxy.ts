import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (process.env.E2E_AUTH_BYPASS === "1") {
    return NextResponse.next();
  }

  if (request.auth?.user) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|login|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|map)$).*)",
  ],
};
