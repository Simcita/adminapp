/**
 * Route Handler: /api/proxy/[...path]
 * -------------------------------------
 * Thin auth-forwarding proxy for client-side SWR requests.
 * Reads the admin_auth_token cookie (set on the Next.js domain)
 * and forwards it to the Express backend so the admin stays
 * authenticated from client components.
 *
 * Example: SWR fetches /api/proxy/admin/metrics
 *          → this handler forwards to http://localhost:5000/admin/metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backend_url } from "@/lib/backend-url";

async function proxy_request(
  request: NextRequest,
  params: { path: string[] }
) {
  const cookie_store = await cookies();
  const token = cookie_store.get("admin_auth_token")?.value;

  const backend_path = "/" + params.path.join("/");
  const search = request.nextUrl.search;
  const target_url = `${backend_url(backend_path)}${search}`;

  const backend_res = await fetch(target_url, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `admin_auth_token=${token}` } : {}),
    },
    body: request.method !== "GET" ? await request.text() : undefined,
  });

  const data = await backend_res.json().catch(() => ({}));

  if (backend_res.status === 401) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json(data, { status: backend_res.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy_request(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy_request(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy_request(request, await params);
}
