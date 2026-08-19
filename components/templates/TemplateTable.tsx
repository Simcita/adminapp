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
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  create_template_action,
  update_template_action,
  toggle_template_action,
} from "@/actions/template.actions";
import type { NotificationTemplate } from "@/lib/types";

interface TemplateTableProps {
  templates: NotificationTemplate[];
}

export default function TemplateTable({ templates }: TemplateTableProps) {
  const [create_open, set_create_open] = useState(false);
  const [create_type, set_create_type] = useState("EMAIL");
  const [edit_target, set_edit_target] = useState<NotificationTemplate | null>(null);
  const [edit_type, set_edit_type] = useState("EMAIL");
  const [is_pending, start_transition] = useTransition();

  function handle_toggle(id: string) {
    start_transition(async () => {
      try {
        await toggle_template_action(id);
        toast.success("Template status updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  function open_edit(t: NotificationTemplate) {
    set_edit_target(t);
    set_edit_type(t.notificationType);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Notification Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage email and WhatsApp message templates
          </p>
        </div>
        <Button size="sm" onClick={() => set_create_open(true)}>
          New Template
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={create_open} onOpenChange={set_create_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              fd.set("notificationType", create_type);
              try {
                await create_template_action(fd);
                set_create_open(false);
                toast.success("Template created.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1">
              <Label>Template Name</Label>
              <Input name="templateName" required />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={create_type} onValueChange={(v) => v && set_create_type(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {create_type === "EMAIL" && (
              <div className="space-y-1">
                <Label>Subject Line</Label>
                <Input name="subjectLine" placeholder="Your verification is confirmed" />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="create_templateBody">Template Body</Label>
              <textarea
                id="create_templateBody"
                name="templateBody"
                rows={5}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                placeholder="Hi {{name}}, your account {{accountId}} has been verified…"
              />
            </div>
            <Button type="submit" className="w-full">Create Template</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!edit_target} onOpenChange={(o) => !o && set_edit_target(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {edit_target && (
            <form
              key={edit_target.id}
              action={async (fd) => {
                fd.set("notificationType", edit_type);
                try {
                  await update_template_action(edit_target.id, fd);
                  set_edit_target(null);
                  toast.success("Template updated.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed.");
                }
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-1">
                <Label>Template Name</Label>
                <Input name="templateName" defaultValue={edit_target.templateName} required />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={edit_type} onValueChange={(v) => v && set_edit_type(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {edit_type === "EMAIL" && (
                <div className="space-y-1">
                  <Label>Subject Line</Label>
                  <Input
                    name="subjectLine"
                    defaultValue={edit_target.subjectLine ?? ""}
                    placeholder="Your verification is confirmed"
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="edit_templateBody">Template Body</Label>
                <textarea
                  id="edit_templateBody"
                  name="templateBody"
                  rows={5}
                  required
                  defaultValue={edit_target.templateBody}
                  placeholder="Hi {{name}}, your account {{accountId}} has been verified…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
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
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No templates yet
                </TableCell>
              </TableRow>
            )}
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.templateName}</TableCell>
                <TableCell>
                  <StatusBadge value={t.notificationType} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.subjectLine ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      t.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => open_edit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handle_toggle(t.id)}
                      disabled={is_pending}
                    >
                      {t.isActive ? "Deactivate" : "Activate"}
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
