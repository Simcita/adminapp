"use client";

import { useState, useTransition } from "react";
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
  create_campaign_action,
  update_campaign_action,
  toggle_campaign_action,
  delete_campaign_action,
} from "@/actions/campaign.actions";
import type { Campaign } from "@/lib/types";

interface CampaignTableProps {
  campaigns: Campaign[];
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const [create_open, set_create_open] = useState(false);
  const [edit_target, set_edit_target] = useState<Campaign | null>(null);
  const [is_pending, start_transition] = useTransition();

  function handle_toggle(id: string) {
    start_transition(async () => {
      try {
        await toggle_campaign_action(id);
        toast.success("Campaign status updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  function handle_delete(id: string, name: string) {
    if (!confirm(`Delete campaign "${name}"? This cannot be undone.`)) return;
    start_transition(async () => {
      try {
        await delete_campaign_action(id);
        toast.success("Campaign deleted.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage affiliate campaigns and their Whop links
          </p>
        </div>
        <Button size="sm" onClick={() => set_create_open(true)}>
          New Campaign
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={create_open} onOpenChange={set_create_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              try {
                await create_campaign_action(fd);
                set_create_open(false);
                toast.success("Campaign created.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1">
              <Label htmlFor="create_campaignName">Campaign Name</Label>
              <Input id="create_campaignName" name="campaignName" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create_brokerName">Broker Name</Label>
              <Input id="create_brokerName" name="brokerName" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create_whopLink">Whop Link</Label>
              <Input id="create_whopLink" name="whopLink" type="url" placeholder="https://whop.com/..." required />
            </div>
            <Button type="submit" className="w-full">Create Campaign</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!edit_target} onOpenChange={(o) => !o && set_edit_target(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          {edit_target && (
            <form
              key={edit_target.id}
              action={async (fd) => {
                try {
                  await update_campaign_action(edit_target.id, fd);
                  set_edit_target(null);
                  toast.success("Campaign updated.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed.");
                }
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-1">
                <Label htmlFor="edit_campaignName">Campaign Name</Label>
                <Input
                  id="edit_campaignName"
                  name="campaignName"
                  defaultValue={edit_target.campaignName}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_brokerName">Broker Name</Label>
                <Input
                  id="edit_brokerName"
                  name="brokerName"
                  defaultValue={edit_target.brokerName}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit_whopLink">Whop Link</Label>
                <Input
                  id="edit_whopLink"
                  name="whopLink"
                  type="url"
                  defaultValue={edit_target.whopLink}
                  required
                />
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
              <TableHead>Name</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Whop Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No campaigns yet
                </TableCell>
              </TableRow>
            )}
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.campaignName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.brokerName}</TableCell>
                <TableCell>
                  <a
                    href={c.whopLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate max-w-xs block"
                  >
                    {c.whopLink}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => set_edit_target(c)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handle_toggle(c.id)}
                      disabled={is_pending}
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handle_delete(c.id, c.campaignName)}
                      disabled={is_pending}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
