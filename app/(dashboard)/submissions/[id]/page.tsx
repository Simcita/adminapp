import Link from "next/link";
import { notFound } from "next/navigation";
import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { SubmissionDetail } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 grid grid-cols-3 gap-4 border-b last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;

  let submission: SubmissionDetail;
  try {
    const res = await server_fetch<{ success: boolean; data: SubmissionDetail }>(
      `/admin/submissions/${id}`,
      { cache: "no-store" }
    );
    submission = res.data;
  } catch {
    notFound();
  }

  return (
    <div>
      <Topbar title="Submission Detail" />
      <div className="p-6 space-y-6 max-w-4xl">

        {/* Back link + header */}
        <div>
          <Link
            href="/submissions"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Submissions
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{submission.name} {submission.surname}</h2>
            <StatusBadge value={submission.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{submission.email}</p>
        </div>

        {/* Personal details */}
        <div className="border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Submission Details</h3>
          <dl>
            <DetailRow label="Full Name" value={`${submission.name} ${submission.surname}`} />
            <DetailRow label="Email" value={submission.email} />
            <DetailRow label="Phone" value={submission.phone} />
            <DetailRow label="IP Address" value={submission.ipAddress} />
            <DetailRow label="Submitted Account ID" value={
              <span className="font-mono">{submission.submittedAccountId}</span>
            } />
            <DetailRow label="Verified Account ID" value={
              submission.xmAccountId
                ? <span className="font-mono text-green-700">{submission.xmAccountId}</span>
                : <span className="text-muted-foreground">Not yet matched</span>
            } />
            <DetailRow label="Campaign" value={submission.campaign?.campaignName} />
            <DetailRow label="Verification Attempts" value={submission.verificationAttempts} />
            <DetailRow label="Submitted At" value={new Date(submission.submittedAt).toLocaleString()} />
            <DetailRow label="Last Updated" value={new Date(submission.updatedAt).toLocaleString()} />
            <DetailRow label="Fulfilled At" value={
              submission.fulfilledAt
                ? new Date(submission.fulfilledAt).toLocaleString()
                : <span className="text-muted-foreground">Pending</span>
            } />
          </dl>
        </div>

        {/* Fulfillment Jobs */}
        <div className="border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Fulfillment Jobs ({submission.fulfillmentJobs.length})</h3>
          </div>
          {submission.fulfillmentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No jobs created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Processed At</TableHead>
                  <TableHead>Last Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.fulfillmentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell><StatusBadge value={job.notificationChannel} /></TableCell>
                    <TableCell><StatusBadge value={job.jobStatus} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.retryCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(job.scheduledFor).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {job.processedAt ? new Date(job.processedAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-red-600 max-w-xs truncate">
                      {job.lastError ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Fulfillment Logs */}
        <div className="border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Delivery Log ({submission.fulfillmentLogs.length})</h3>
          </div>
          {submission.fulfillmentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No delivery attempts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider Response</TableHead>
                  <TableHead>Attempted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.fulfillmentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell><StatusBadge value={log.fulfillmentType} /></TableCell>
                    <TableCell><StatusBadge value={log.deliveryStatus} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                      {log.providerResponse ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

      </div>
    </div>
  );
}
