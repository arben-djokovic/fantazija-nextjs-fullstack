import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // Next.js interni fajlovi, API i fajlovi sa ekstenzijom (slike, css...) ne idu kroz prevođenje.
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // 404 stranica nije u [locale] i ne zna adresu, pa joj je šaljemo da zastavice vode na istu adresu na drugom jeziku.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  matcher: "/:path*",
};
