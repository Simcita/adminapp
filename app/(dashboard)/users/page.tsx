import { cookies } from "next/headers";
import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import AdminUsersTable from "@/components/users/AdminUsersTable";
import type { AdminUser } from "@/lib/types";

function get_admin_id_from_token(token: string): string {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return decoded.admin_id ?? "";
  } catch {
    return "";
  }
}

export default async function UsersPage() {
  const cookie_store = await cookies();
  const token = cookie_store.get("admin_auth_token")?.value ?? "";
  const current_admin_id = get_admin_id_from_token(token);

  let users: AdminUser[] = [];
  let access_denied = false;

  try {
    const res = await server_fetch<{ success: boolean; data: AdminUser[] }>(
      "/admin/users",
      { cache: "no-store" }
    );
    users = res.data;
  } catch (e) {
    if (e instanceof Error && e.message.includes("403")) {
      access_denied = true;
    } else if (e instanceof Error && e.message === "UNAUTHORIZED") {
      access_denied = true;
    } else {
      access_denied = true;
    }
  }

  if (access_denied) {
    return (
      <div>
        <Topbar title="Admin Users" />
        <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
          <svg className="h-12 w-12 text-muted-foreground mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2 className="text-lg font-semibold mb-1">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            Only SUPER_ADMIN accounts can manage admin users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Admin Users" />
      <div className="p-6">
        <AdminUsersTable users={users} current_admin_id={current_admin_id} />
      </div>
    </div>
  );
}
