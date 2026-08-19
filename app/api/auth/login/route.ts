/**
 * Route Handler: POST /api/auth/login
 * ------------------------------------
 * Proxies the admin login request to the Express backend and
 * sets an HttpOnly cookie on the Next.js domain (localhost:3000).
 *
 * Why this proxy exists:
 *   The Express backend sets its own cookie on localhost:5000.
 *   The Next.js dashboard runs on localhost:3000 — a different
 *   origin. The browser cannot read the backend cookie from a
 *   different port, so Next.js middleware would never see it.
 *
 *   This Route Handler receives the login form POST, calls the
 *   backend, reads the JWT from the response *body* (not the
 *   Set-Cookie header), and sets a new HttpOnly cookie on the
 *   Next.js origin so middleware can read it.
 *
 * Request body: { email: string, password: string }
 * Response:     { success, data: { admin, token } } from backend
 */

import { NextRequest, NextResponse } from "next/server";
import { backend_url } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backend_res = await fetch(backend_url("/admin/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backend_res.json();

    if (!backend_res.ok) {
      return NextResponse.json(data, { status: backend_res.status });
    }

    // Set the token as an HttpOnly cookie on the Next.js domain
    const response = NextResponse.json(data, { status: 200 });

    response.cookies.set("admin_auth_token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days — matches backend
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
