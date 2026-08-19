import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/shared/StatusBadge";
import PaginationControls from "@/components/shared/PaginationControls";
import StatusFilter from "@/components/shared/StatusFilter";
import SearchInput from "@/components/shared/SearchInput";
import RetryJobButton from "@/components/jobs/RetryJobButton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { FulfillmentJob, PaginatedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; channel?: string; search?: string }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params  = await searchParams;
  const page    = params.page    ?? "1";
  const status  = params.status  ?? "";
  const channel = params.channel ?? "";
  const search  = params.search  ?? "";

  const query = new URLSearchParams({ page, limit: "20" });
  if (status)  query.set("status", status);
  if (channel) query.set("channel", channel);
  if (search)  query.set("search", search);

  const res = await server_fetch<PaginatedResponse<FulfillmentJob>>(
    `/admin/jobs?${query}`,
    { next: { revalidate: 30, tags: ["jobs"] } }
  );

  return (
    <div>
      <Topbar title="Jobs" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Fulfillment Jobs</h2>
          <div className="flex gap-3">
            <SearchInput placeholder="Search recipient, account…" />
            <StatusFilter
              options={["PENDING", "PROCESSING", "COMPLETED", "FAILED"]}
              placeholder="All statuses"
            />
            <StatusFilter
              options={["WHATSAPP", "EMAIL"]}
              param="channel"
              placeholder="All channels"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {res.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No jobs found
                  </TableCell>
                </TableRow>
              )}
              {res.data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{job.submission.name}</div>
                    <div className="text-xs text-muted-foreground">{job.submission.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {job.submission.xmAccountId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={job.notificationChannel} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={job.jobStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.retryCount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {job.jobStatus === "FAILED" && (
                      <RetryJobButton job_id={job.id} />
                    )}
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
