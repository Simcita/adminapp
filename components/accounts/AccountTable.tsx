"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  create_xm_account_action,
  update_xm_account_action,
} from "@/actions/account.actions";
import type { XmApprovedAccount } from "@/lib/types";
import { format_date } from "@/lib/format-date";

interface AccountTableProps {
  accounts: XmApprovedAccount[];
}

export default function AccountTable({ accounts }: AccountTableProps) {
  const [create_open, set_create_open] = useState(false);
  const [edit_target, set_edit_target] = useState<XmApprovedAccount | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">XM Approved Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manually add an account for rare edge cases (e.g. the parser missed
            an email) — normal signup is entirely automatic.
          </p>
        </div>
        <Button size="sm" onClick={() => set_create_open(true)}>
          Add Account
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={create_open} onOpenChange={set_create_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manually Add XM Account</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              try {
                await create_xm_account_action(fd);
                set_create_open(false);
                toast.success("Account added.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1">
              <Label htmlFor="create_accountId">Account ID</Label>
              <Input id="create_accountId" name="accountId" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create_emailSubject">Email Subject</Label>
              <Input id="create_emailSubject" name="emailSubject" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create_senderEmail">Sender Email</Label>
              <Input id="create_senderEmail" name="senderEmail" type="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create_rawEmailExcerpt">Raw Email Excerpt</Label>
              <textarea
                id="create_rawEmailExcerpt"
                name="rawEmailExcerpt"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="create_parsedSuccessfully"
                name="parsedSuccessfully"
                type="checkbox"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="create_parsedSuccessfully">Parsed successfully</Label>
            </div>
            <Button type="submit" className="w-full">Add Account</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!edit_target} onOpenChange={(o) => !o && set_edit_target(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit XM Account</DialogTitle>
          </DialogHeader>
          {edit_target && (
            <form
              key={edit_target.id}
              action={async (fd) => {
                try {
                  await update_xm_account_action(edit_target.id, fd);
                  set_edit_target(null);
                  toast.success("Account updated.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed.");
                }
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-1">
                <Label htmlFor="edit_accountId">Account ID</Label>
                <Input
                  id="edit_accountId"
                  name="accountId"
                  defaultValue={edit_target.accountId}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_emailSubject">Email Subject</Label>
                <Input
                  id="edit_emailSubject"
                  name="emailSubject"
                  defaultValue={edit_target.emailSubject ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_senderEmail">Sender Email</Label>
                <Input
                  id="edit_senderEmail"
                  name="senderEmail"
                  type="email"
                  defaultValue={edit_target.senderEmail ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_rawEmailExcerpt">Raw Email Excerpt</Label>
                <textarea
                  id="edit_rawEmailExcerpt"
                  name="rawEmailExcerpt"
                  rows={3}
                  defaultValue={edit_target.rawEmailExcerpt ?? ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit_parsedSuccessfully"
                  name="parsedSuccessfully"
                  type="checkbox"
                  value="true"
                  defaultChecked={edit_target.parsedSuccessfully}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="edit_parsedSuccessfully">Parsed successfully</Label>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account ID</TableHead>
              <TableHead>Email Subject</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Verified Claims</TableHead>
              <TableHead>Fetched</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No accounts found
                </TableCell>
              </TableRow>
            )}
            {accounts.map((account) => {
              const verified_count = account.submissions.filter(
                (s) => s.status === "VERIFIED"
              ).length;

              return (
                <TableRow key={account.id}>
                  <TableCell className="font-mono font-medium">
                    {account.accountId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {account.emailSubject ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.senderEmail ?? "—"}
                  </TableCell>
                  <TableCell>
                    {verified_count > 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {verified_count} verified
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unclaimed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format_date(account.fetchedAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => set_edit_target(account)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
