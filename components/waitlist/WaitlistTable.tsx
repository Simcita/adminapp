"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  add_waitlist_entry_action,
  send_waitlist_links_action,
  send_single_waitlist_link_action,
} from "@/actions/waitlist.actions";
import type { LivestreamWaitlistEntry } from "@/lib/types";

const DEFAULT_SUBJECT = "Your livestream links are here";
const DEFAULT_BODY =
  "Hi {{name}},\n\n" +
  "Here's how to join the livestream community:\n\n" +
  "Discord: <paste your link here>\n" +
  "Telegram: <paste your link here>\n\n" +
  "See you there!";

interface WaitlistTableProps {
  entries: LivestreamWaitlistEntry[];
}

export default function WaitlistTable({ entries }: WaitlistTableProps) {
  const [subject, set_subject] = useState(DEFAULT_SUBJECT);
  const [body, set_body] = useState(DEFAULT_BODY);
  const [is_pending, start_transition] = useTransition();
  const [sending_id, set_sending_id] = useState<string | null>(null);
  const [add_open, set_add_open] = useState(false);

  const pending_count = entries.filter(
    (e) => e.status === "PENDING" || e.status === "FAILED"
  ).length;

  function handle_send() {
    if (pending_count === 0) {
      toast.error("Nobody is PENDING or FAILED — nothing to send.");
      return;
    }

    if (
      !confirm(
        `Send livestream links to ${pending_count} pending/failed entr${pending_count === 1 ? "y" : "ies"}? This cannot be undone.`
      )
    ) {
      return;
    }

    start_transition(async () => {
      try {
        const fd = new FormData();
        fd.set("subject", subject);
        fd.set("body", body);
        const result = await send_waitlist_links_action(fd);
        toast.success(
          `Sent: ${result.sent}, Failed: ${result.failed}${
            result.failedEmails.length > 0
              ? ` (${result.failedEmails.join(", ")})`
              : ""
          }`
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  function handle_send_one(entry: LivestreamWaitlistEntry) {
    if (!confirm(`Send livestream links to ${entry.name} ${entry.surname} (${entry.email})?`)) {
      return;
    }

    set_sending_id(entry.id);
    start_transition(async () => {
      try {
        const fd = new FormData();
        fd.set("subject", subject);
        fd.set("body", body);
        await send_single_waitlist_link_action(entry.id, fd);
        toast.success(`Sent to ${entry.email}.`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      } finally {
        set_sending_id(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => set_add_open(true)}>
          Add to waitlist
        </Button>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={add_open} onOpenChange={set_add_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Waitlist</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              try {
                await add_waitlist_entry_action(fd);
                set_add_open(false);
                toast.success("Added to waitlist.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1">
              <Label htmlFor="add_name">First name</Label>
              <Input id="add_name" name="name" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add_surname">Last name</Label>
              <Input id="add_surname" name="surname" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add_email">Email</Label>
              <Input id="add_email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add_xmAccountId">MT ID</Label>
              <Input id="add_xmAccountId" name="xmAccountId" required />
              <p className="text-xs text-muted-foreground">
                Not checked against approved accounts — you&apos;re adding this
                person directly.
              </p>
            </div>
            <Button type="submit" className="w-full">Add to Waitlist</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Send livestream links</h2>
          <span className="text-sm text-muted-foreground">
            {pending_count} pending/failed
          </span>
        </div>

        <div className="space-y-1">
          <Label htmlFor="waitlist_subject">Subject</Label>
          <input
            id="waitlist_subject"
            value={subject}
            onChange={(e) => set_subject(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="waitlist_body">
            Body — sent exactly as written, only {"{{name}}"} is replaced per
            recipient. Nothing is added automatically — include any links
            yourself.
          </Label>
          <textarea
            id="waitlist_body"
            value={body}
            onChange={(e) => set_body(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        </div>

        <Button onClick={handle_send} disabled={is_pending}>
          {is_pending ? "Sending…" : "Send links to everyone"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>MT ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No waitlist entries yet
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {entry.name} {entry.surname}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.email}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.xmAccountId}
                </TableCell>
                <TableCell>
                  <StatusBadge value={entry.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(entry.joinedAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handle_send_one(entry)}
                    disabled={is_pending}
                  >
                    {sending_id === entry.id ? "Sending…" : "Send"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
