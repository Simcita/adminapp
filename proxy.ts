/**
 * Next.js 16 Proxy — Auth Guard
 * --------------------------------
 * Runs on the Edge before every matched request.
 * Checks for the admin_auth_token cookie:
 *
 *   • Missing cookie on a protected route → redirect to /login
 *   • Valid cookie on /login → redirect to /dashboard
 *
 * Only checks cookie *presence* — not JWT validity.
 * Expired tokens are caught when server_fetch() gets a 401.
 *
 * Next.js 16 renamed "middleware" → "proxy" and the export
 * function must also be named "proxy" (not "middleware").
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "admin_auth_token";

// /login redirects away if already authenticated (no reason to log in twice).
const PUBLIC_PATHS = ["/login"];

// These are always accessible, logged in or not — no-login public utility
// pages (Door Check, Livestream Waitlist Signup). Unlike /login, visiting
// them while authenticated should NOT redirect to /dashboard.
const PUBLIC_UTILITY_PATHS = ["/check-account", "/waitlist-signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const is_public = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const is_public_utility = PUBLIC_UTILITY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Skip auth check for Next.js internals and API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (is_public_utility) {
    return NextResponse.next();
  }

  const has_token = request.cookies.has(AUTH_COOKIE);

  // Unauthenticated user trying to access a protected route
  if (!is_public && !has_token) {
    const login_url = new URL("/login", request.url);
    login_url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login_url);
  }

  // Authenticated user landing on the login page
  if (is_public && has_token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
