import Link from "next/link";
import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/shared/StatusBadge";
import PaginationControls from "@/components/shared/PaginationControls";
import SearchInput from "@/components/shared/SearchInput";
import StatusFilter from "@/components/shared/StatusFilter";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { UserSubmission, PaginatedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page   ?? "1";
  const status = params.status ?? "";
  const search = params.search ?? "";

  const query = new URLSearchParams({ page, limit: "20" });
  if (status) query.set("status", status);
  if (search) query.set("search", search);

  const res = await server_fetch<PaginatedResponse<UserSubmission>>(
    `/admin/submissions?${query}`,
    { next: { revalidate: 30, tags: ["submissions"] } }
  );

  return (
    <div>
      <Topbar title="Submissions" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">User Submissions</h2>
          <div className="flex gap-3">
            <SearchInput placeholder="Search name, email, account…" />
            <StatusFilter
              options={["PENDING", "VERIFIED", "FAILED", "DUPLICATE"]}
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {res.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
              {res.data.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={`/submissions/${s.id}`} className="block">
                      {s.name} {s.surname}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <Link href={`/submissions/${s.id}`} className="block">
                      {s.email}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <Link href={`/submissions/${s.id}`} className="block">
                      {s.submittedAccountId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Link href={`/submissions/${s.id}`} className="block">
                      {s.campaign?.campaignName ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/submissions/${s.id}`} className="block">
                      <StatusBadge value={s.status} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Link href={`/submissions/${s.id}`} className="block">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <PaginationControls meta={res.meta} />
      </div>
    </div>
  );
}
