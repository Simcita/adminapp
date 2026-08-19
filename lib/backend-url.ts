/**
 * backend_url()
 * -------------
 * Builds a URL against the Express backend from NEXT_PUBLIC_API_URL,
 * normalizing slashes so a trailing slash on the env var (or a path
 * missing its leading slash) can never produce a double-slash path
 * like `//api/check-account` — Express doesn't match those and 404s.
 *
 * Single source of truth: every route handler and server action that
 * talks to the backend should build its URL through this function
 * instead of concatenating NEXT_PUBLIC_API_URL directly.
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

export function backend_url(path: string): string {
  const normalized_path = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized_path}`;
}
