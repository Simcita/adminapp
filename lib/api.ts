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
import { backend_url } from "@/lib/backend-url";

export async function server_fetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookie_store = await cookies();
  const token = cookie_store.get("admin_auth_token")?.value;

  const res = await fetch(backend_url(path), {
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
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      errors?: { path?: (string | number)[]; message: string }[];
    };

    const field_detail = Array.isArray(body.errors)
      ? body.errors
          .map((e) => `${(e.path ?? []).join(".") || "field"}: ${e.message}`)
          .join("; ")
      : undefined;

    const base_message = body.message ?? `HTTP ${res.status}`;

    throw new Error(
      field_detail ? `${base_message} ${field_detail}` : base_message
    );
  }

  return res.json() as Promise<T>;
}
