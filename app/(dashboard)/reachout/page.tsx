import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import ReachoutTable from "@/components/reachout/ReachoutTable";
import type { UserSubmission, PaginatedResponse } from "@/lib/types";

// Bulk sends are chunked and paced sequentially against Resend's rate
// limit (~15-20s for a few hundred recipients, same reasoning as the
// waitlist bulk-send) — give this route's functions more room than
// the platform default.
export const maxDuration = 60;

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function ReachoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status ?? "";
  const search = params.search ?? "";

  // No real pagination here on purpose — Reachout needs every matching
  // submission loaded at once so "select everyone" actually means
  // everyone, not just the current page. 1000 matches the bulk-send
  // endpoint's own per-request recipient cap.
  const query = new URLSearchParams({ page: "1", limit: "1000" });
  if (status) query.set("status", status);
  if (search) query.set("search", search);

  const res = await server_fetch<PaginatedResponse<UserSubmission>>(
    `/admin/submissions?${query}`,
    { cache: "no-store" }
  );

  return (
    <div>
      <Topbar
        title="Reachout"
        description="Email any or all submissions with a custom message"
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reachout</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {res.data.length} submission{res.data.length === 1 ? "" : "s"} matching current filters
            </p>
          </div>
          <div className="flex gap-3">
            <SearchInput placeholder="Search name, email, account…" />
            <StatusFilter options={["PENDING", "VERIFIED", "FAILED", "DUPLICATE"]} />
          </div>
        </div>

        <ReachoutTable submissions={res.data} />
      </div>
    </div>
  );
}
