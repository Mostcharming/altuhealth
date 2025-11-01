import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/signin", "/reset", "/verify", "/_next", "/public"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  console.log("Middleware - Auth Token:", token);

  if (!token) {
    const signinUrl = new URL("/signin", req.url);
    signinUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
