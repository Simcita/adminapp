/**
 * server_fetch<T>()
 * -----------------
 * Authenticated fetch wrapper for Server Components and
 * Server Actions. Reads the admin_auth_token cookie from
 * the Next.js cookie store (set by the /api/auth/login
 * Route Handler on the Next.js domain) and forwards it
 * to the Express backend in the Cookie header.
 *
 * This runs entirely on the server — the token never
 * touches the browser after the initial login.
 *
 * Usage (Server Component):
 *   const data = await server_fetch<SubmissionsResponse>(
 *     "/admin/submissions?page=1",
 *     { next: { revalidate: 30, tags: ["submissions"] } }
 *   );
 *
 * Usage (Server Action):
 *   await server_fetch("/admin/campaigns", {
 *     method: "POST",
 *     body: JSON.stringify(payload),
 *   });
 *
 * Parameters:
 * -----------
 * path    : string      — backend path, e.g. "/admin/submissions"
 * options : RequestInit — merged with auth header defaults
 *
 * Returns:
 * --------
 * Promise<T>  throws on non-2xx; throws "UNAUTHORIZED" on 401
 */

import { cookies } from "next/headers";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

export async function server_fetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookie_store = await cookies();
  const token = cookie_store.get("admin_auth_token")?.value;

  const normalized_path = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${normalized_path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `admin_auth_token=${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}
