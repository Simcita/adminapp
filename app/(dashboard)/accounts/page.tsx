import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import PaginationControls from "@/components/shared/PaginationControls";
import SearchInput from "@/components/shared/SearchInput";
import AccountTable from "@/components/accounts/AccountTable";
import type { XmApprovedAccount, PaginatedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AccountsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page   ?? "1";
  const search = params.search ?? "";

  const query = new URLSearchParams({ page, limit: "20" });
  if (search) query.set("search", search);

  const res = await server_fetch<PaginatedResponse<XmApprovedAccount>>(
    `/admin/accounts?${query}`,
    { cache: "no-store" }
  );

  return (
    <div>
      <Topbar title="XM Accounts" />
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <SearchInput placeholder="Search account ID, sender…" />
        </div>

        <AccountTable accounts={res.data} />

        <PaginationControls meta={res.meta} />
      </div>
    </div>
  );
}
