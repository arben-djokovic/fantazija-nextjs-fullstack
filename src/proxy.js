import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // Next.js interni fajlovi, API i fajlovi sa ekstenzijom (slike, css...) ne idu kroz prevođenje.
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  return handleI18n(request);
}

export const config = {
  matcher: "/:path*",
};
