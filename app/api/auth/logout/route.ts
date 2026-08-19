/**
 * Route Handler: POST /api/auth/logout
 * --------------------------------------
 * Calls the backend logout endpoint, then clears the
 * admin_auth_token cookie from the Next.js domain.
 * Redirects to /login after clearing.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backend_url } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  const cookie_store = await cookies();
  const token = cookie_store.get("admin_auth_token")?.value;

  // Best-effort backend logout — don't block on failure
  try {
    await fetch(backend_url("/admin/auth/logout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `admin_auth_token=${token}` } : {}),
      },
    });
  } catch {
    // Swallow — we always clear the local cookie regardless
  }

  const response = NextResponse.redirect(
    new URL("/login", request.url)
  );

  response.cookies.delete("admin_auth_token");

  return response;
}
