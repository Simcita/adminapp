"use server";

import { revalidatePath } from "next/cache";
import { server_fetch } from "@/lib/api";

export async function create_admin_user_action(form_data: FormData) {
  const payload = {
    fullName: form_data.get("fullName") as string,
    email:    form_data.get("email") as string,
    password: form_data.get("password") as string,
    role:     (form_data.get("role") as string) || "ADMIN",
  };

  await server_fetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/users");
}

export async function toggle_admin_user_action(user_id: string) {
  await server_fetch(`/admin/users/${user_id}/toggle`, {
    method: "PATCH",
  });

  revalidatePath("/users");
}
