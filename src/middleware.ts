import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = /^\/app(\/.*)?$/;

export default auth((req) => {
  const isProtected = PROTECTED.test(req.nextUrl.pathname);
  if (isProtected && !req.auth) {
    const url = new URL("/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // already signed in → bounce away from /signin
  if (req.nextUrl.pathname === "/signin" && req.auth) {
    return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/app/:path*", "/signin"],
};
