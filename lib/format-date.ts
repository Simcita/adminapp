/**
 * format_date() / format_datetime()
 * ----------------------------------
 * Locale AND time zone must both be pinned for server-rendered timestamps —
 * locale alone still leaves the zone to the runtime's default, and the
 * Vercel server (UTC) rendering a different wall-clock time than the
 * viewer's browser is exactly what trips React hydration error #418
 * ("server HTML didn't match client").
 *
 * Pinned to Africa/Johannesburg (SAST, UTC+2, no DST) since that's this
 * app's audience — every viewer sees the same string regardless of where
 * the Vercel function or their own browser happens to run.
 */

const TIME_ZONE = "Africa/Johannesburg";

export function format_date(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", { timeZone: TIME_ZONE });
}

export function format_datetime(value: string | Date): string {
  return new Date(value).toLocaleString("en-US", { timeZone: TIME_ZONE });
}
