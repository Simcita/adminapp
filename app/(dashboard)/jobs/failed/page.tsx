/**
 * Dead-Letter Queue Page — Server Component
 * -------------------------------------------
 * Lists jobs that exhausted all retry attempts.
 * Shows the failure reason and the full payload snapshot
 * for forensic investigation.
 *
 * Cache: 60 second revalidation tagged "failed-jobs".
 */

import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/shared/StatusBadge";
import PaginationControls from "@/components/shared/PaginationControls";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { FailedJob, PaginatedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function FailedJobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page ?? "1";

  const res = await server_fetch<PaginatedResponse<FailedJob>>(
    `/admin/jobs/failed?page=${page}&limit=20`,
    { next: { revalidate: 60, tags: ["failed-jobs"] } }
  );

  return (
    <div>
      <Topbar title="Dead Letter Queue" />
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Dead-Letter Queue</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Jobs that failed after 3 retry attempts. Review the failure reason
            and use the Jobs page to retry the original job if needed.
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original Job ID</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Failure Reason</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Failed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {res.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No failed jobs — great!
                  </TableCell>
                </TableRow>
              )}
              {res.data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {job.originalJobId}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={job.notificationChannel} />
                  </TableCell>
                  <TableCell className="text-sm max-w-sm text-red-700">
                    {job.failureReason}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.retryAttempts}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(job.failedAt).toLocaleString()}
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
