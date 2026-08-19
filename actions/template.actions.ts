"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { server_fetch } from "@/lib/api";

export async function create_template_action(form_data: FormData) {
  const payload = {
    templateName:     form_data.get("templateName") as string,
    notificationType: form_data.get("notificationType") as string,
    subjectLine:      (form_data.get("subjectLine") as string) || undefined,
    templateBody:     form_data.get("templateBody") as string,
    isActive:         form_data.get("isActive") !== "false",
  };

  await server_fetch("/admin/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/templates");
  redirect("/templates");
}

export async function update_template_action(
  template_id: string,
  form_data: FormData
) {
  const payload: Record<string, unknown> = {};

  const name    = form_data.get("templateName") as string;
  const subject = form_data.get("subjectLine") as string;
  const body    = form_data.get("templateBody") as string;

  if (name)    payload.templateName = name;
  if (subject) payload.subjectLine  = subject;
  if (body)    payload.templateBody = body;

  await server_fetch(`/admin/templates/${template_id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  revalidatePath("/templates");
}

export async function toggle_template_action(template_id: string) {
  await server_fetch(`/admin/templates/${template_id}/toggle`, {
    method: "PATCH",
  });

  revalidatePath("/templates");
}
