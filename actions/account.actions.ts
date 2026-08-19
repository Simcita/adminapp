"use server";

import { revalidatePath } from "next/cache";
import { server_fetch } from "@/lib/api";

export async function create_xm_account_action(form_data: FormData) {
  const payload = {
    accountId: form_data.get("accountId") as string,
    emailSubject: (form_data.get("emailSubject") as string) || undefined,
    senderEmail: (form_data.get("senderEmail") as string) || undefined,
    rawEmailExcerpt: (form_data.get("rawEmailExcerpt") as string) || undefined,
    parsedSuccessfully: form_data.get("parsedSuccessfully") !== "false",
  };

  await server_fetch("/admin/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/accounts");
}

export async function update_xm_account_action(
  account_id: string,
  form_data: FormData
) {
  const payload: Record<string, unknown> = {};

  const account_id_value = form_data.get("accountId") as string;
  const email_subject = form_data.get("emailSubject") as string;
  const sender_email = form_data.get("senderEmail") as string;
  const raw_excerpt = form_data.get("rawEmailExcerpt") as string;

  if (account_id_value) payload.accountId = account_id_value;
  if (email_subject) payload.emailSubject = email_subject;
  if (sender_email) payload.senderEmail = sender_email;
  if (raw_excerpt) payload.rawEmailExcerpt = raw_excerpt;
  payload.parsedSuccessfully = form_data.get("parsedSuccessfully") !== "false";

  await server_fetch(`/admin/accounts/${account_id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  revalidatePath("/accounts");
}
