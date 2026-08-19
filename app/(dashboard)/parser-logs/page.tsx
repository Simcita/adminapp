import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/shared/StatusBadge";
import PaginationControls from "@/components/shared/PaginationControls";
import SearchInput from "@/components/shared/SearchInput";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ParserLog, PaginatedResponse } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ParserLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page   ?? "1";
  const search = params.search ?? "";

  const query = new URLSearchParams({ page, limit: "20" });
  if (search) query.set("search", search);

  const res = await server_fetch<PaginatedResponse<ParserLog>>(
    `/admin/parser-logs?${query}`,
    { next: { revalidate: 60, tags: ["parser-logs"] } }
  );

  return (
    <div>
      <Topbar title="Parser Logs" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Gmail Parser Logs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One row per affiliate email the IMAP worker processed.
              FAILED rows indicate emails where the XM account ID could not be extracted.
            </p>
          </div>
          <SearchInput placeholder="Search subject, sender, account…" />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Extracted Account</TableHead>
                <TableHead>Failure Reason</TableHead>
                <TableHead>Parsed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {res.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No parser logs yet
                  </TableCell>
                </TableRow>
              )}
              {res.data.map((log) => (
                <TableRow
                  key={log.id}
                  className={log.parsingStatus === "FAILED" ? "bg-red-50/30" : undefined}
                >
                  <TableCell className="text-sm max-w-xs truncate">
                    {log.emailSubject ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.senderEmail ?? "—"}
                  </TableCell>
                  <TableCell>
                    {log.parsingStatus ? (
                      <StatusBadge value={log.parsingStatus} />
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.extractedAccountId ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-red-600 max-w-xs truncate">
                    {log.failureReason ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
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
