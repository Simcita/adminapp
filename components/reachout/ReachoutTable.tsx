"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import { send_bulk_email_action } from "@/actions/email.actions";
import type { UserSubmission } from "@/lib/types";

interface ReachoutTableProps {
  submissions: UserSubmission[];
}

export default function ReachoutTable({ submissions }: ReachoutTableProps) {
  const [selected, set_selected] = useState<Set<string>>(new Set());
  const [subject, set_subject] = useState("");
  const [body, set_body] = useState("");
  const [is_pending, start_transition] = useTransition();

  const all_selected = submissions.length > 0 && selected.size === submissions.length;

  function toggle_all() {
    if (all_selected) {
      set_selected(new Set());
    } else {
      set_selected(new Set(submissions.map((s) => s.id)));
    }
  }

  function toggle_one(id: string) {
    set_selected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handle_send() {
    if (selected.size === 0) {
      toast.error("Select at least one recipient first.");
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are both required.");
      return;
    }

    if (
      !confirm(
        `Send this email to ${selected.size} recipient${selected.size === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }

    const recipients = submissions
      .filter((s) => selected.has(s.id))
      .map((s) => ({ email: s.email, name: `${s.name} ${s.surname}`.trim() }));

    start_transition(async () => {
      const fd = new FormData();
      fd.set("subject", subject);
      fd.set("body", body);

      const result = await send_bulk_email_action(recipients, fd);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        `Sent: ${result.sent}, Failed: ${result.failed}${
          result.failedEmails.length > 0 ? ` (${result.failedEmails.join(", ")})` : ""
        }`
      );
      set_selected(new Set());
    });
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compose</h2>
          <span className="text-sm text-muted-foreground">
            {selected.size} of {submissions.length} selected
          </span>
        </div>

        <div className="space-y-1">
          <Label htmlFor="reachout_subject">Subject</Label>
          <Input
            id="reachout_subject"
            value={subject}
            onChange={(e) => set_subject(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="reachout_body">
            Body — sent exactly as written, only {"{{name}}"} is replaced per
            recipient. Nothing is added automatically.
          </Label>
          <textarea
            id="reachout_body"
            value={body}
            onChange={(e) => set_body(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handle_send} disabled={is_pending}>
            {is_pending ? "Sending…" : `Send to ${selected.size} selected`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={toggle_all}
            disabled={submissions.length === 0}
          >
            {all_selected ? "Deselect all" : "Select everyone"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={all_selected}
                  onChange={toggle_all}
                  aria-label="Select all"
                  className="h-4 w-4 rounded border-input accent-primary"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No submissions match the current filters
                </TableCell>
              </TableRow>
            )}
            {submissions.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggle_one(s.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle_one(s.id)}
                    aria-label={`Select ${s.email}`}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {s.name} {s.surname}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                <TableCell className="font-mono text-sm">{s.submittedAccountId}</TableCell>
                <TableCell>
                  <StatusBadge value={s.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(s.submittedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
