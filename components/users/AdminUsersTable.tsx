"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  create_admin_user_action,
  toggle_admin_user_action,
} from "@/actions/admin-users.actions";
import type { AdminUser, AdminRole } from "@/lib/types";

interface AdminUsersTableProps {
  users: AdminUser[];
  current_admin_id: string;
}

const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-violet-50 text-violet-700 border-violet-200",
  ADMIN:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  SUPPORT:     "bg-sky-50 text-sky-700 border-sky-200",
};

export default function AdminUsersTable({ users, current_admin_id }: AdminUsersTableProps) {
  const [open, set_open] = useState(false);
  const [role, set_role] = useState<AdminRole>("ADMIN");
  const [is_pending, start_transition] = useTransition();

  function handle_toggle(id: string) {
    start_transition(async () => {
      try {
        await toggle_admin_user_action(id);
        toast.success("Admin user status updated.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Admin Users</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin accounts — SUPER_ADMIN access only
          </p>
        </div>
        <Button size="sm" onClick={() => set_open(true)}>
          New Admin
        </Button>
      </div>

      <Dialog open={open} onOpenChange={set_open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              fd.set("role", role);
              try {
                await create_admin_user_action(fd);
                set_open(false);
                toast.success("Admin user created.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1">
              <Label htmlFor="admin_fullName">Full Name</Label>
              <Input id="admin_fullName" name="fullName" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin_email">Email</Label>
              <Input id="admin_email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin_password">Password</Label>
              <Input
                id="admin_password"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => v && set_role(v as AdminRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Create Admin</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No admin users found
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.fullName}
                  {u.id === current_admin_id && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={ROLE_COLORS[u.role]}>
                    {u.role.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      u.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-US") : "Never"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={is_pending || u.id === current_admin_id}
                    onClick={() => handle_toggle(u.id)}
                    title={u.id === current_admin_id ? "Cannot deactivate yourself" : undefined}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
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
