import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import PaginationControls from "@/components/shared/PaginationControls";
import StatusFilter from "@/components/shared/StatusFilter";
import SearchInput from "@/components/shared/SearchInput";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AuditLog, PaginatedResponse } from "@/lib/types";

const EVENT_TYPES = [
  "ADMIN_LOGIN",
  "ADMIN_LOGOUT",
  "ADMIN_USER_CREATED",
  "ADMIN_USER_TOGGLED",
  "CAMPAIGN_CREATED",
  "CAMPAIGN_UPDATED",
  "CAMPAIGN_DELETED",
  "TEMPLATE_CREATED",
  "TEMPLATE_UPDATED",
  "SUBMISSION_CREATED",
  "SUBMISSION_VERIFIED",
  "FULFILLMENT_JOB_CREATED",
  "FULFILLMENT_COMPLETED",
  "FULFILLMENT_FAILED",
  "FULFILLMENT_DEAD_LETTER",
  "JOB_MANUALLY_RETRIED",
];

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const params     = await searchParams;
  const page       = params.page   ?? "1";
  const event_type = params.status ?? "";
  const search     = params.search ?? "";

  const query = new URLSearchParams({ page, limit: "20" });
  if (event_type) query.set("event_type", event_type);
  if (search)     query.set("search", search);

  const res = await server_fetch<PaginatedResponse<AuditLog>>(
    `/admin/audit-logs?${query}`,
    { next: { revalidate: 60, tags: ["audit-logs"] } }
  );

  return (
    <div>
      <Topbar title="Audit Logs" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Audit Trail</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Immutable log of all admin actions and system events
            </p>
          </div>
          <div className="flex gap-3">
            <SearchInput placeholder="Search description, performer…" />
            <StatusFilter
              options={EVENT_TYPES}
              placeholder="All event types"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {res.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
              {res.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {log.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-sm">
                    {log.eventDescription}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {log.performedBy === "SYSTEM"
                      ? <span className="text-blue-500">SYSTEM</span>
                      : log.performedBy
                        ? log.performedBy.slice(0, 8) + "…"
                        : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {log.entityId ? log.entityId.slice(0, 8) + "…" : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
