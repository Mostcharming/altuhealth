import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { useAuthStore } from "./lib/authStore";

const publicRoutes = ["/signin", "/reset", "/verify", "/_next", "/public"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }
  const token = useAuthStore.getState().token;
  if (!token) {
    const signinUrl = new URL("/signin", req.url);
    signinUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
