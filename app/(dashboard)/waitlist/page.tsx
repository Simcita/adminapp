import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import PaginationControls from "@/components/shared/PaginationControls";
import StatusFilter from "@/components/shared/StatusFilter";
import WaitlistTable from "@/components/waitlist/WaitlistTable";
import type { LivestreamWaitlistEntry, PaginatedResponse } from "@/lib/types";

// The bulk send action on this page can take ~15-20s for a large waitlist
// (Resend batch calls are chunked and sent sequentially to respect rate
// limits) — give this route's functions more room than the platform default.
export const maxDuration = 60;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function WaitlistPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page   ?? "1";
  const status = params.status ?? "";

  const query = new URLSearchParams({ page, limit: "50" });
  if (status) query.set("status", status);

  const res = await server_fetch<PaginatedResponse<LivestreamWaitlistEntry>>(
    `/admin/waitlist?${query}`,
    { cache: "no-store" }
  );

  return (
    <div>
      <Topbar title="Livestream Waitlist" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Waitlist</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Signups from the public livestream waitlist form
            </p>
          </div>
          <StatusFilter options={["PENDING", "SENT", "FAILED"]} />
        </div>

        <WaitlistTable entries={res.data} />

        <PaginationControls meta={res.meta} />
      </div>
    </div>
  );
}
